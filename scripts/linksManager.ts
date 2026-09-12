import { WorkItem, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
// import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
import { getChildWitName, getMetaState, getOrderFieldName, getState, MetaState } from "./backlogConfiguration";
import { IWorkItemLink } from "./components/IWorkItemLink";
import { getStatus, renderLinks, setError, setStatus } from "./components/showLinks";
import { IProperties, trackEvent } from "./events";
import { areaField, assignedTo, iterationField, projField, stateField, titleField, witField } from "./fieldConstants";
import { getRelationTypes, IRelationLookup } from "./relationTypes";
import { getWit } from "./workItemTypes";

let prevLinks: string = "";
let rels: WorkItemRelation[] = [];
let wis: {[id: number]: WorkItem} = {};
let selected = -1;

function normalizeBaseUrl(url: string): string {
    return (url || "").replace(/\/+$/, "").toLowerCase();
}

function isLocalWorkItemUrl(url: string): boolean {
    const localBase = normalizeBaseUrl(VSS.getWebContext().host.uri);
    const targetUrl = normalizeBaseUrl(url);

    return !!targetUrl && targetUrl.startsWith(localBase + "/");
}

function wiIdFromUrl(url: string): number {
    if (!url || !isLocalWorkItemUrl(url)) {
        return -1;
    }

    const match = url.match(/workitems\/(\d+)(?:$|[/?#])/i);
    return match ? Number(match[1]) : -1;
}

function getLinkType(types: IRelationLookup, name: string) {
    if (!name) {
        return null;
    }

    return types[name] || types[name.replace(/-Forward$|-Reverse$/, "")] || null;
}

async function linkedWiIds() {
    const relTypes = await getRelationTypes();

    return rels
        .filter((rel) => {
            const linkType = getLinkType(relTypes, rel.rel);

            return !!linkType
                && !!linkType.attributes
                && linkType.attributes.usage === "workItemLink"
                && wiIdFromUrl(rel.url) > 0;
        })
        .map(({url}) => wiIdFromUrl(url));
}

async function tryExecute(callback: () => Promise<void>) {
    try {
        await callback();
        setStatus("");
    } catch (error) {
        const message = (
            typeof error === "string" ? error : (error.serverError || error || {}).message
        ) ||
        error + "" ||
        "unknown error";

        // tslint:disable-next-line:no-console
        console.error(error);
        trackEvent("error", {message, stack: error && error.stack, status: getStatus(), ...getProps()});
        setError(message);
    }
}

function getProps(): IProperties {
    return {
        wiCount: Object.keys(wis).length + "",
        relCount: rels.length + "",
    };
}

export async function updateWiState(trigger: string, workitem: WorkItem, metaState: MetaState) {
    tryExecute(async () => {
        trackEvent("updateState", {metaState, trigger, ...getProps()});
        const {
            [projField]: project,
            [witField]: witName,
        } = workitem.fields;
        const patch: JsonPatchDocument & JsonPatchOperation[] = [
            {
                op: Operation.Add,
                path: `/fields/${stateField}`,
                value: await getState(project, witName, metaState),
            } as JsonPatchOperation,
        ];
        setStatus("Updating work item state...");
        const wi = await getClient().updateWorkItem(patch, workitem.id);
        wis[wi.id] = wi;
        selected = wi.id;
        await update();
    });
}

export async function refreshLinksForNewWi() {
    tryExecute(async () => {
        trackEvent("refresh", {new: "true", ...getProps()});
        prevLinks = "";
        renderLinks({links: [], selected});
    });
}

export async function deleteWi(trigger: string, wi: WorkItem) {
    tryExecute(async () => {
        trackEvent("delete", {trigger, ...getProps()});
        setStatus("Deleting work item...");
        await getClient().deleteWorkItem(wi.id);
        delete wis[wi.id];

        const idx = rels.map(({url}) => wiIdFromUrl(url)).indexOf(wi.id);
        rels.splice(idx, 1);
        await update();
        // const service = await WorkItemFormService.getService();
        // await service.refresh();
    });
}

export async function moveLink(trigger: string, link: IWorkItemLink, dir: "up" | "down") {
    tryExecute(async () => {
        trackEvent("moveLink", {dir, trigger, ...getProps()});
        const service = await WorkItemFormService.getService();
        const project = await service.getFieldValue(projField) as string;
        const orderField = await getOrderFieldName(project);
        const orderedWis: WorkItem[] = [];
        for (const id in wis) {
            orderedWis.push(wis[id]);
        }
        orderedWis.sort((a, b) => a.fields[orderField] - b.fields[orderField]);
        if (orderedWis.length === 0) {
            return;
        }
        const currRank = link.wi.fields[orderField] as number;
        const currIdx = orderedWis.map(({id}) => id).indexOf(link.wi.id);

        let otherRank: number;
        let otherId: number;
        if (dir === "up") {
            if (currIdx === 0) { return; }
            otherRank = orderedWis[currIdx - 1].fields[orderField];
            otherId = orderedWis[currIdx - 1].id;
        } else if (dir === "down") {
            if (currIdx === orderedWis.length - 1) { return; }
            otherRank = orderedWis[currIdx + 1].fields[orderField];
            otherId = orderedWis[currIdx + 1].id;
        }
        const currPatch: JsonPatchDocument & JsonPatchOperation[] = [
            {
                op: Operation.Add,
                path: `/fields/${orderField}`,
                value: otherRank,
            } as JsonPatchOperation,
        ];
        const otherPatch: JsonPatchDocument & JsonPatchOperation[] = [
            {
                op: Operation.Add,
                path: `/fields/${orderField}`,
                value: currRank,
            } as JsonPatchOperation,
        ];
        setStatus("Moving work items...");
        const [currUpdate, otherUpdate] = await Promise.all([
            getClient().updateWorkItem(currPatch, link.wi.id),
            getClient().updateWorkItem(otherPatch, otherId),
        ]);
        selected = currUpdate.id;
        wis[currUpdate.id] = currUpdate;
        wis[otherUpdate.id] = otherUpdate;
        await update();
    });
}

export async function createChildWi(trigger: string, childTitle: string) {
    tryExecute(async () => {
        trackEvent("create", {type: "child", trigger, ...getProps()});

        const service = await WorkItemFormService.getService();
        const fields = await service.getFieldValues([
            witField,
            projField,
            areaField,
            iterationField,
        ]);

        const wit = fields[witField] as string;
        const project = fields[projField] as string;
        const area = fields[areaField] as string;
        const iteration = fields[iterationField] as string;
        const parentId = await service.getId();

        if (!project) {
            throw new Error("Could not determine current project.");
        }

        if (!wit) {
            throw new Error("Could not determine current work item type.");
        }

        if (!parentId) {
            throw new Error("Please save the current work item before adding a child.");
        }

        const childWitName = await getChildWitName(project, wit);

        const patch = [
            {
                op: Operation.Add,
                path: `/fields/${titleField}`,
                value: childTitle,
            } as JsonPatchOperation,
            {
                op: Operation.Add,
                path: "/relations/-",
                value: {
                    rel: "System.LinkTypes.Hierarchy-Reverse",
                    url: await service.getWorkItemResourceUrl(parentId),
                    attributes: {
                        comment: "Created from the Links Group extension",
                    },
                },
            } as JsonPatchOperation,
        ] as JsonPatchDocument & JsonPatchOperation[];

        if (area) {
            patch.push({
                op: Operation.Add,
                path: `/fields/${areaField}`,
                value: area,
            } as JsonPatchOperation);
        }

        if (iteration) {
            patch.push({
                op: Operation.Add,
                path: `/fields/${iterationField}`,
                value: iteration,
            } as JsonPatchOperation);
        }

        try {
            const orderField = await getOrderFieldName(project);
            const parentRank = await service.getFieldValue(orderField) as number;

            const ranks: number[] = [];
            if (typeof parentRank === "number" && !isNaN(parentRank)) {
                ranks.push(parentRank);
            }

            for (const id in wis) {
                const rank = wis[id].fields[orderField] as number;
                if (typeof rank === "number" && !isNaN(rank)) {
                    ranks.push(rank);
                }
            }

            if (ranks.length > 0) {
                ranks.sort((a, b) => b - a);
                patch.push({
                    op: Operation.Add,
                    path: `/fields/${orderField}`,
                    value: ranks[0] + 1,
                } as JsonPatchOperation);
            }
        } catch (error) {
            // ignore missing backlog/order configuration
        }

        const assignee = await service.getFieldValue(assignedTo);
        if (assignee) {
            patch.push({
                op: Operation.Add,
                path: `/fields/${assignedTo}`,
                value: assignee,
            } as JsonPatchOperation);
        }

        setStatus("Creating work item...");
        const child = await getClient().createWorkItem(patch, project, childWitName);

        rels.push({url: child.url, rel: "System.LinkTypes.Hierarchy-Forward"} as WorkItemRelation);
        wis[child.id] = child;
        selected = child.id;

        await update();
    });
}

export async function selectWi(id: number) {
    tryExecute(async () => {
        selected = id;
        await update();
    });
}

export async function renameWi(trigger: string, child: WorkItem, title: string) {
    tryExecute(async () => {
        trackEvent("rename", {trigger, ...getProps()});
        const patch: JsonPatchDocument & JsonPatchOperation[] = [
            {
                op: Operation.Add,
                path: `/fields/${titleField}`,
                value: title,
            } as JsonPatchOperation,
        ];
        setStatus("Renaming work item...");
        const updated = await getClient().updateWorkItem(patch, child.id);
        wis[updated.id] = updated;
        selected = updated.id;
        await update();
    });
}

export async function unlink(trigger: string, link: IWorkItemLink) {
    tryExecute(async () => {
        trackEvent("unlink", {trigger, ...getProps()});
        const service = await WorkItemFormService.getService();
        await service.removeWorkItemRelations([link.link]);
    });
}

async function update() {
    setStatus("");

    const navService: any = await VSS.getService(VSS.ServiceIds.Navigation);
    const relTypes = await getRelationTypes();

    const links: IWorkItemLink[] = (await Promise.all(
        rels.map(async (rel): Promise<IWorkItemLink | null> => {
            const linkType = getLinkType(relTypes, rel.rel);

            if (!linkType || !linkType.attributes || linkType.attributes.usage !== "workItemLink") {
                return null;
            }

            const wiId = wiIdFromUrl(rel.url);
            if (wiId <= 0) {
                return null;
            }

            const wi = wis[wiId];
            if (!wi || !wi.fields) {
                return null;
            }

            const wiProject = wi.fields[projField];
            const workItemTypeName = wi.fields[witField];
            const state = wi.fields[stateField];

            if (!wiProject || !workItemTypeName || !state) {
                return null;
            }

            const metastate = await getMetaState(wiProject, workItemTypeName, state);
            if (!metastate) {
                return null;
            }

            return {
                wi,
                link: rel,
                relationType: linkType,
                metastate,
                navService,
                workItemType: await getWit(wiProject, workItemTypeName),
            };
        }),
    )).filter((rel): rel is IWorkItemLink => !!rel);

    const formService = await WorkItemFormService.getService();
    const project = await formService.getFieldValue(projField) as string;

    links.sort(await getRelationComparer(project));
    await renderLinks({links, selected});
}

async function getRelationComparer(project: string) {
    const field = await getOrderFieldName(project);
    return (a: IWorkItemLink, b: IWorkItemLink) => {
        const v1 = a.wi.fields[field];
        const v2 = b.wi.fields[field];
        if (v1 && v2) {
            return v1 - v2;
        } else if (v1) {
            return -1;
        } else if (v2) {
            return 1;
        } else {
            return a.wi.id - b.wi.id;
        }
    };
}

let refreshCounter = 0;
export async function refreshLinks(force: boolean = false) {
    tryExecute(async () => {
        trackEvent("refresh", {new: "false", ...getProps()});
        const start = ++refreshCounter;
        const service = await WorkItemFormService.getService();
        rels = (await service.getWorkItemRelations()).filter(
            (rel) => !rel.attributes.isDeleted,
        );
        if (start !== refreshCounter) {
            return;
        }
        const linksKey = rels.map((r) => r.url).join(",");
        if (linksKey === prevLinks && !force) {
            return;
        }
        prevLinks = linksKey;
        setStatus("Getting linked workitems...");
        const wiIds = await linkedWiIds();
        const wiArr = wiIds.length > 0 ? await getClient().getWorkItems(wiIds) : [];
        if (start !== refreshCounter) {
            return;
        }
        wis = {};
        for (const wi of wiArr) {
            wis[wi.id] = wi;
        }
        await update();
    });
}

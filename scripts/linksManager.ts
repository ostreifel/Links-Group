import { WorkItem, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
import { getChildWitName, getMetaState, getOrderFieldName, getState, MetaState } from "./backlogConfiguration";
import { IWorkItemLink } from "./components/IWorkItemLink";
import { renderLinks } from "./components/showLinks";
import { areaField, iterationField, projField, stateField, titleField, witField } from "./fieldConstants";

let prevLinks: string = "";
let rels: WorkItemRelation[] = [];
let wis: {[id: number]: WorkItem} = {};

function idFromUrl(url: string): number {
    const match = url.match(/\d+$/);
    return match ? Number(match[0]) : -1;
}

export async function updateWiState(workitem: WorkItem, metaState: MetaState) {
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
    const wi = await getClient().updateWorkItem(patch, workitem.id);
    wis[wi.id] = wi;
    await update();
}

export async function refreshLinksForNewWi() {
    prevLinks = "";
    renderLinks([]);
}

export async function deleteWi(wi: WorkItem) {
    await getClient().deleteWorkItem(wi.id);
    delete wis[wi.id];

    const idx = rels.map(({url}) => idFromUrl(url)).indexOf(wi.id);
    rels.splice(idx, 1);
    // await update();
    const service = await WorkItemFormService.getService();
    await service.refresh();
}

export async function createChildWi(childTitle: string) {
    const service = await WorkItemFormService.getService();
    const {
        [witField]: wit,
        [projField]: project,
        [areaField]: area,
        [iterationField]: iteration,
    } = await service.getFieldValues([
        witField,
        projField,
        areaField,
        iterationField,
    ]);
    const orderField = await getOrderFieldName(project);
    const parentRank = await service.getFieldValue(orderField) as number;
    const childWitName = await getChildWitName(project, wit);
    const ranks = [parentRank];
    for (const id in wis) {
        ranks.push(wis[id].fields[orderField] as number);
    }
    ranks.sort((a, b) => b - a); // largest first
    const patch: JsonPatchDocument & JsonPatchOperation[] = [
        {
            op: Operation.Add,
            path: `/fields/${titleField}`,
            value: childTitle,
        } as JsonPatchOperation,
        {
            op: Operation.Add,
            path: `/fields/${areaField}`,
            value: area,
        } as JsonPatchOperation,
        {
            op: Operation.Add,
            path: `/fields/${iterationField}`,
            value: iteration,
        } as JsonPatchOperation,
        {
            op: Operation.Add,
            path: `/fields/${orderField}`,
            value: ranks[0] + 1,
        } as JsonPatchOperation,
        {
            op: Operation.Add,
            path: "/relations/-",
            value: {
                rel: "System.LinkTypes.Hierarchy-Reverse",
                url: await service.getWorkItemResourceUrl(await service.getId()),
                attributes: {
                    comment: "Created from the Links Group extension",
                },
            },
        } as JsonPatchOperation,
    ];
    const child = await getClient().createWorkItem(patch, project, childWitName);
    rels.push({url: child.url} as WorkItemRelation);
    wis[child.id] = child;
    await update();
    // await service.refresh();
}

export async function renameChild(child: WorkItem, title: string) {
    const patch: JsonPatchDocument & JsonPatchOperation[] = [
        {
            op: Operation.Add,
            path: `/fields/${titleField}`,
            value: title,
        } as JsonPatchOperation,
    ];
    const updated = await getClient().updateWorkItem(patch, child.id);
    wis[updated.id] = updated;
    await update();
}

export async function unlink(link: IWorkItemLink) {
    const service = await WorkItemFormService.getService();
    service.removeWorkItemRelations([link.link]);
}

async function update() {
    const navService = await VSS.getService<HostNavigationService>(VSS.ServiceIds.Navigation);
    const links: IWorkItemLink[] = await Promise.all(rels.map(async (rel): Promise<IWorkItemLink> => {
        const wi = wis[idFromUrl(rel.url)];
        return {
            wi,
            link: rel,
            metastate: await getMetaState(wi.fields[projField], wi.fields[witField], wi.fields[stateField]),
            navService,
        };
    }));
    const formService = await WorkItemFormService.getService();
    const project = await formService.getFieldValue(projField) as string;
    links.sort(await getRelationComparer(project));
    renderLinks(links);
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
    const start = ++refreshCounter;
    const service = await WorkItemFormService.getService();
    rels = (await service.getWorkItemRelations()).filter((rel) => !rel.attributes.isDeleted);
    if (start !== refreshCounter) {
        return;
    }
    const linksKey = rels.map((r) => r.url).join(",");
    if (linksKey === prevLinks && !force) {
        return;
    }
    prevLinks = linksKey;
    const wiArr = rels.length > 0 ? await getClient().getWorkItems(rels.map((rel) => idFromUrl(rel.url))) : [];
    if (start !== refreshCounter) {
        return;
    }
    wis = {};
    for (const wi of wiArr) {
        wis[wi.id] = wi;
    }
    await update();
}

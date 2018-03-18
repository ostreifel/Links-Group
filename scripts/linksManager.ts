import { WorkItem, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
import { getChildWit, getMetaState, getState, MetaState } from "./backlogConfiguration";
import { IWorkItemLink } from "./components/IWorkItemLink";
import { renderLinks } from "./components/showLinks";
import { projField, stateField, titleField, witField } from "./fieldConstants";

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
    const {[projField]: project, [witField]: wit } = await service.getFieldValues([witField, projField]);
    const childWit = await getChildWit(project, wit);
    const patch: JsonPatchDocument & JsonPatchOperation[] = [
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
                url: await service.getWorkItemResourceUrl(await service.getId()),
                attributes: {
                    comment: "Created from the Links Group extension",
                },
            },
        } as JsonPatchOperation,
    ];
    const child = await getClient().createWorkItem(patch, project, childWit);
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
    renderLinks(links);
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

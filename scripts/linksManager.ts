import { WorkItem, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
import { getMetaState, getState, MetaState } from "./backlogConfiguration";
import { projField, stateField, witField } from "./fieldConstants";
import { renderLinks } from "./LinkGroupView";

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
    update();
}

export async function refreshLinksForNewWi() {
    prevLinks = "";
    renderLinks([]);
}

async function update() {
    const links = await Promise.all(rels.map(async (rel) => {
        const wi = wis[idFromUrl(rel.url)];
        return {
            wi,
            link: rel,
            metastate: await getMetaState(wi.fields[projField], wi.fields[witField], wi.fields[stateField]),
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
    const wiArr = await getClient().getWorkItems(rels.map((rel) => idFromUrl(rel.url)));
    if (start !== refreshCounter) {
        return;
    }
    wis = {};
    for (const wi of wiArr) {
        wis[wi.id] = wi;
    }
    await update();
}

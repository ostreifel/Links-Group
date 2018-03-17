import { WorkItem, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
import { getMetaState, getState, MetaState } from "./backlogConfiguration";
import { projField, stateField, witField } from "./fieldConstants";
import { renderLinks } from "./LinkGroupView";

let prevLinks: string = "";

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
    return await getClient().updateWorkItem(patch, workitem.id);
}

export async function refreshLinksForNewWi() {
    prevLinks = "";
    renderLinks([]);
}

export async function refreshLinks(force: boolean = false) {
    const service = await WorkItemFormService.getService();
    const relations = (await service.getWorkItemRelations()).filter((rel) => !rel.attributes.isDeleted);
    const relMap: {[id: number]: WorkItemRelation} = {};
    for (const rel of relations) {
        relMap[idFromUrl(rel.url)] = rel;
    }
    const linksKey = Object.keys(relMap).join(",");
    if (linksKey === prevLinks && !force) {
        return;
    }
    prevLinks = linksKey;
    const wis = await getClient().getWorkItems(relations.map((rel) => idFromUrl(rel.url)));
    renderLinks(await Promise.all(wis.map(async (wi) => ({
        wi,
        link: relMap[wi.id],
        metastate: await getMetaState(wi.fields[projField], wi.fields[witField], wi.fields[stateField]),
    }))));
}

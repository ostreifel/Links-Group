import { WorkItemType } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";

const wits: {[key: string]: IPromise<WorkItemType>} = {};
export function getWit(projName: string, witName: string): IPromise<WorkItemType> {
    const key = `${projName} ${witName}`;
    if (!(key in wits)) {
        wits[key] = getClient().getWorkItemType(projName, witName);
    }
    return wits[key];
}
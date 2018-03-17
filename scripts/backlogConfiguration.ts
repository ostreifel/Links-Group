import { TeamContext } from "TFS/Core/Contracts";
import { BacklogConfiguration } from "TFS/Work/Contracts";
import { getClient } from "TFS/Work/RestClient";

const backlogs: {[project: string]: IPromise<BacklogConfiguration>} = {};
export function getConfiguration(project: string): IPromise<BacklogConfiguration> {
    if (!(project in backlogs)) {
        backlogs[project] = getClient().getBacklogConfigurations({project} as TeamContext);
    }
    return backlogs[project];
}

export async function getState(project: string, witName: string, metaState: "Proposed" | "Completed"): Promise<string> {
    const config = await getConfiguration(project);
    const [{states}] = config.workItemTypeMappedStates.filter((s) => s.workItemTypeName === witName);
    for (const state in states) {
        if (states[state] === metaState) {
            return state;
        }
    }
    throw new Error(`Could not find state for ${project}, ${witName}, ${metaState}`);
}

import { TeamContext } from "TFS/Core/Contracts";
import { BacklogConfiguration } from "TFS/Work/Contracts";
import { getClient } from "TFS/Work/RestClient";
import { trackEvent } from "./events";

const backlogs: {[project: string]: IPromise<BacklogConfiguration>} = {};
export function getConfiguration(project: string): IPromise<BacklogConfiguration> {
    if (!(project in backlogs)) {
        backlogs[project] = getClient().getBacklogConfigurations({project} as TeamContext);
    }
    return backlogs[project];
}

export type MetaState = "Completed" | "Proposed";

export async function getState(project: string, witName: string, metaState: MetaState): Promise<string> {
    const config = await getConfiguration(project);
    const [{states}] = config.workItemTypeMappedStates.filter((s) => s.workItemTypeName === witName);
    for (const state in states) {
        if (states[state] === metaState) {
            return state;
        }
    }
    throw new Error(`Could not find state for ${project}, ${witName}, ${metaState}`);
}

export async function getMetaState(project: string, witName: string, state: string): Promise<MetaState | ""> {
    const config = await getConfiguration(project);
    const [stateInfo] = config.workItemTypeMappedStates.filter((s) => s.workItemTypeName === witName);
    if (!stateInfo) {
        trackEvent("missingStateInfo", {witName, state, states: JSON.stringify(config.workItemTypeMappedStates)});
        return "";
    }
    const {states} = stateInfo;
    return states[state] as MetaState;
}

export async function getChildWitName(project: string, witName: string): Promise<string> {
    const config = await getConfiguration(project);
    const levels = [config.requirementBacklog, config.taskBacklog, ...config.portfolioBacklogs].filter((a) => !!a);
    levels.sort((a, b) => b.rank - a.rank);

    const [{rank}] = levels.filter((lvl) => lvl.workItemTypes.filter(({name}) => name === witName).length > 0);
    for (const level of levels) {
        if (level.rank < rank) {
            return level.defaultWorkItemType.name;
        }
    }
    // Default child to bottom type in the case when in the bottom backlog (ex: task)
    return levels[levels.length].defaultWorkItemType.name;
}

export async function getOrderFieldName(project: string): Promise<string> {
    const config = await getConfiguration(project);
    return config.backlogFields.typeFields.Order;
}

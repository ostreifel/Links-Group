import { WorkItemRelationType } from "TFS/WorkItemTracking/Contracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";

/**
 * Type the attributes property of the relation type;
 */
export interface ILinkType extends WorkItemRelationType {
    attributes: (
        (
            {
                usage: "workItemLink";
                acyclic: boolean;
                directional: boolean;
                singleTarget: boolean;
            } & (
                {
                    topology: "tree" | "dependency";
                    oppositeEndReferenceName: string;
                } |
                {
                    topology: "network";
                }
            )
        ) | {
            usage: "resourceLink";
        }
    ) & {
        editable: boolean;
        enabled: boolean;
    };
}

export interface IRelationLookup { [referenceName: string]: ILinkType; }

let promise: IPromise<IRelationLookup>;

export async function getRelationTypes() {
    if (!promise) {
        promise = getClient().getRelationTypes().then((rels): IRelationLookup => {
            const map: IRelationLookup = {};
            for (const rel of rels) {
                map[rel.referenceName] = rel as ILinkType;
            }
            return map;
        });
    }
    return await promise;
}

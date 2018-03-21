import { WorkItem, WorkItemRelation, WorkItemType } from "TFS/WorkItemTracking/Contracts";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { MetaState } from "../backlogConfiguration";
import { ILinkType } from "../relationTypes";

export interface IWorkItemLink {
    wi: WorkItem;
    link: WorkItemRelation;
    relationType: ILinkType;
    metastate: MetaState;
    navService: HostNavigationService;
    workItemType: WorkItemType;
}

import { WorkItem, WorkItemRelation, WorkItemType } from "TFS/WorkItemTracking/Contracts";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { MetaState } from "../backlogConfiguration";

export interface IWorkItemLink {
    wi: WorkItem;
    link: WorkItemRelation;
    metastate: MetaState;
    navService: HostNavigationService;
    workItemType: WorkItemType;
}

import { WorkItemType, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { IWorkItemFieldChangedArgs, IWorkItemNotificationListener, IWorkItemLoadedArgs } from "TFS/WorkItemTracking/ExtensionContracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { CachedValue } from "./cachedValue";
import { getListItemTexts } from "./htmlParser";
import * as Q from "q";
import { getWit } from "./workItemTypes";

const projectField = "System.TeamProject";
const witField = "System.WorkItemType";


interface IAssociatedWorkItemTypes {
    currentType: WorkItemType;
    childType: string;
}

export class LinkGroupEvents implements IWorkItemNotificationListener {
    public onLoaded(workItemLoadedArgs: IWorkItemLoadedArgs): void {
        WorkItemFormService.getService().then(service => {
            service.getWorkItemRelations
        });
        throw new Error("Method not implemented.");
    }
    public onFieldChanged(fieldChangedArgs: IWorkItemFieldChangedArgs): void {
        throw new Error("Method not implemented.");
    }
    public onSaved(/*savedEventArgs: IWorkItemChangedArgs*/): void {
        return;
    }
    public onRefreshed(/*refreshEventArgs: IWorkItemChangedArgs*/): void {
        throw new Error("Method not implemented.");
    }
    public onReset(/*undoEventArgs: IWorkItemChangedArgs*/): void {
        throw new Error("Method not implemented.");
    }
    public onUnloaded(/*unloadedEventArgs: IWorkItemChangedArgs*/): void {
        throw new Error("Method not implemented.");
    }
    private _getWorkItemType(): Q.IPromise<WorkItemType> {
        return WorkItemFormService.getService().then((service) =>
            service.getFieldValues([witField, projectField]).then(
                ({[projectField]: project, [witField]: wit}) => getWit(project, wit)
            ),
        );
    }
}

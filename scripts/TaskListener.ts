import { IWorkItemFieldChangedArgs, IWorkItemNotificationListener } from "TFS/WorkItemTracking/ExtensionContracts";
import {  } from "./HtmlParser";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

export class TaskListener implements IWorkItemNotificationListener {
    public onLoaded(/*workItemLoadedArgs: IWorkItemLoadedArgs*/): void {
        throw new Error("Method not implemented.");
    }
    public onFieldChanged(fieldChangedArgs: IWorkItemFieldChangedArgs): void {
        this._getWorkItemType().then((wit) => {

        });
        throw new Error("Method not implemented.");
    }
    public onSaved(/*savedEventArgs: IWorkItemChangedArgs*/): void {
        throw new Error("Method not implemented.");
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
    private _getWorkItemType(): Q.IPromise<string> {
        return WorkItemFormService.getService().then((service) =>
            service.getFieldValue("System.WorkItemType") as Q.IPromise<string>,
        );
    }
}

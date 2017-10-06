import { IWorkItemNotificationListener } from "TFS/WorkItemTracking/ExtensionContracts";

export class TaskListener implements IWorkItemNotificationListener {
    public onLoaded(/*workItemLoadedArgs: IWorkItemLoadedArgs*/): void {
        throw new Error("Method not implemented.");
    }
    public onFieldChanged(/*fieldChangedArgs: IWorkItemFieldChangedArgs*/): void {
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
}

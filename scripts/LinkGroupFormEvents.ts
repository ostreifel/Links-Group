import { IWorkItemLoadedArgs, IWorkItemNotificationListener } from "TFS/WorkItemTracking/ExtensionContracts";
import { refreshLinks, refreshLinksForNewWi } from "./linksManager";

export class LinkGroupFormEvents implements IWorkItemNotificationListener {
    public async onLoaded(workItemLoadedArgs: IWorkItemLoadedArgs): Promise<void> {
        if (workItemLoadedArgs.isNew) {
            refreshLinksForNewWi();
        } else {
            refreshLinks(true);
        }
    }
    public onFieldChanged(/*fieldChangedArgs: IWorkItemFieldChangedArgs*/): void {
        refreshLinks(false);
    }
    public onSaved(/*savedEventArgs: IWorkItemChangedArgs*/): void {
        return;
    }
    public onRefreshed(/*refreshEventArgs: IWorkItemChangedArgs*/): void {
        refreshLinks(true);
    }
    public onReset(/*undoEventArgs: IWorkItemChangedArgs*/): void {
        refreshLinks(true);
    }
    public onUnloaded(/*unloadedEventArgs: IWorkItemChangedArgs*/): void {
        // throw new Error("Method not implemented.");
    }
}

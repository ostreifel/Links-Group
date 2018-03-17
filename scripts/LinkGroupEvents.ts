import { WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { IWorkItemLoadedArgs, IWorkItemNotificationListener } from "TFS/WorkItemTracking/ExtensionContracts";
import { getClient } from "TFS/WorkItemTracking/RestClient";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { renderLinks } from "./LinkGroup";

function idFromUrl(url: string): number {
    const match = url.match(/\d+$/);
    return match ? Number(match[0]) : -1;
}

export class LinkGroupEvents implements IWorkItemNotificationListener {
    private prevLinks: string = "";
    public async onLoaded(workItemLoadedArgs: IWorkItemLoadedArgs): Promise<void> {
        if (!workItemLoadedArgs.isNew) {
            this.prevLinks = "";
            renderLinks([]);
            return;
        }
        this.refreshLinks(true);
    }
    public onFieldChanged(/*fieldChangedArgs: IWorkItemFieldChangedArgs*/): void {
        this.refreshLinks(false);
    }
    public onSaved(/*savedEventArgs: IWorkItemChangedArgs*/): void {
        return;
    }
    public onRefreshed(/*refreshEventArgs: IWorkItemChangedArgs*/): void {
        this.refreshLinks(true);
    }
    public onReset(/*undoEventArgs: IWorkItemChangedArgs*/): void {
        this.refreshLinks(true);
    }
    public onUnloaded(/*unloadedEventArgs: IWorkItemChangedArgs*/): void {
        // throw new Error("Method not implemented.");
    }
    private async refreshLinks(force: boolean = false) {
        const service = await WorkItemFormService.getService();
        const relations = (await service.getWorkItemRelations()).filter((rel) => !rel.attributes.isDeleted);
        const relMap: {[id: number]: WorkItemRelation} = {};
        for (const rel of relations) {
            relMap[idFromUrl(rel.url)] = rel;
        }
        const linksKey = Object.keys(relMap).join(",");
        if (linksKey === this.prevLinks && !force) {
            return;
        }
        this.prevLinks = linksKey;
        const wis = await getClient().getWorkItems(relations.map((rel) => idFromUrl(rel.url)));
        renderLinks(wis.map((wi) => ({wi, link: relMap[wi.id]})));
    }
}

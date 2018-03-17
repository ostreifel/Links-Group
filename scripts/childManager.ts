// import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
// import { getClient } from "TFS/WorkItemTracking/RestClient";
// import { JsonPatchDocument, JsonPatchOperation, Operation } from "VSS/WebApi/Contracts";
// import { WorkItemRelation } from "TFS/WorkItemTracking/Contracts";

// const childLinkType = "System.LinkTypes.Hierarchy-Forward";

// export class ChildWorkItem {
//     public static fromTitle(title: string): Q.IPromise<ChildWorkItem> {
//         const patchDoc: JsonPatchDocument & JsonPatchOperation[] = [
//             {
//                 op: Operation.Add,
//                 path: '/fields/System.Title',
//                 value: title,
//             }
//         ];
//         getClient().createWorkItem(patchDoc);
//     }
//     public id: WorkItemRelation;
//     public title: string;
//     constructor(rel: WorkItemRelation) {
//         rel = {
//             attributes: {},
//             rel: childLinkType,
            
//         }
//         this.title = title;
//     }
//     public save(): Q.IPromise<void> {
//         const patchDocument: JsonPatchDocument = [
//             {}
//         ];
//         if (id) {
//             return getClient().updateWorkItem(, this.id);
//         }
//         WorkItemFormService.getService().then((service) => {
//             service.addWorkItemRelations()
//         });
//     }
// }

// export class ChildManager {
    
//     private _getChildIds(): Q.IPromise<ChildWorkItem[]> {
//         return WorkItemFormService.getService().then((wiservice) =>
//             wiservice.getWorkItemRelations().then((relations): number[] =>
//                 relations.filter((r) => r.rel === childLinkType)
//                     .map((r) => r.url.match(/(\d+)$/))
//                     .filter((m) => !!m)
//                     .map(m => Number(m[1]))
//             ),
//         );
//     }
// }
///<reference types="vss-web-extension-sdk" />

import { MessageHelper } from "./logic/messageHelper";

const actionProvider: IContributedMenuSource = {
    getMenuItems: () => {
        return [<IContributedMenuItem>{
            title: "Work Item Menu Action",
            action: (actionContext) => {
                let workItemId = actionContext.id
                    || (actionContext.ids && actionContext.ids.length > 0 && actionContext.ids[0])
                    || (actionContext.workItemIds && actionContext.workItemIds.length > 0 && actionContext.workItemIds[0]);

                if (workItemId) {
                    let messageHelper = new MessageHelper();
                    alert(messageHelper.format([workItemId]));
                }
            }
        }];
    }
};

// Register context menu action provider
VSS.register(VSS.getContribution().id, actionProvider);

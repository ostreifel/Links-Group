/// <reference types="vss-web-extension-sdk" />
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { LinkGroupFormEvents } from "./LinkGroupFormEvents";

// save on ctr + s
$(window).bind("keydown", (event: JQueryEventObject) => {
    if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which).toLowerCase() === "s") {
            event.preventDefault();
            WorkItemFormService.getService().then((service) => service.beginSaveWorkItem($.noop, $.noop));
        }
    }
});

// Register context menu action provider
VSS.register(VSS.getContribution().id, new LinkGroupFormEvents());

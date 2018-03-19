import * as React from "react";
import * as ReactDOM from "react-dom";
import { ILinkProps, Links } from "./Links";

function afterRender() {
    $("#links-container .link .checkbox").attr("data-is-focusable", "false").attr("tab-index", -1);
    VSS.resize();
}

export function renderLinks(props: ILinkProps): Promise<void> {
    return new Promise<void>((resolve) => {
        ReactDOM.render(<Links {...props}/>, document.getElementById("links-container"), () => {
            afterRender();
            resolve();
        });
    });
}

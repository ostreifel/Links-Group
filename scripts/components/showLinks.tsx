import * as React from "react";
import * as ReactDOM from "react-dom";
import { IWorkItemLink } from "./IWorkItemLink";
import { Links } from "./Links";

function afterRender() {
    $("#links-container .link .checkbox").attr("data-is-focusable", "false").attr("tab-index", -1);
    VSS.resize();
}

export function renderLinks(links: IWorkItemLink[]) {
    ReactDOM.render(<Links links={links}/>, document.getElementById("links-container"), afterRender);
}

import * as React from "react";
import * as ReactDOM from "react-dom";
import { IWorkItemLink } from "./IWorkItemLink";
import { Links } from "./Links";

export function renderLinks(links: IWorkItemLink[]) {
    ReactDOM.render(<Links links={links}/>, document.getElementById("links-container"), () => VSS.resize());
}

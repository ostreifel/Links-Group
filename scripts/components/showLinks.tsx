import * as React from "react";
import * as ReactDOM from "react-dom";
import { ILinkProps, Links } from "./Links";

function resize() {
    const altMin = $(".callout").outerHeight();
    if (altMin > $(".main-content").outerHeight()) {
        VSS.resize(undefined, altMin + 16);
    } else {
        VSS.resize();
    }
}

function afterRender() {
    $("#links-container .link .checkbox").attr("data-is-focusable", "false").attr("tab-index", -1);

    $(".error-message").text("");
    $(".status-message").text("");
    resize();
}

export function setStatus(message: string) {
    $(".error-message").text("");
    $(".status-message").text(message);
    resize();
}

export function setError(message: string) {
    $(".status-message").text("");
    $(".error-message").text(message);
    resize();
}

export function renderLinks(props: ILinkProps): Promise<void> {
    return new Promise<void>((resolve) => {
        ReactDOM.render(<Links {...props}/>, document.getElementById("links-container"), () => {
            afterRender();
            resolve();
        });
    });
}

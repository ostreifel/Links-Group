import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { MetaState } from "../backlogConfiguration";
import { deleteWi, updateWiState } from "../linksManager";
import { IWorkItemLink } from "./IWorkItemLink";

export class Link extends React.Component<{link: IWorkItemLink}, {}> {
    public render() {
        const {wi, metastate } = this.props.link;

        return <div
            className="link"
            tabIndex={0}
            data-is-focusable={true}
            onKeyDown={this._onKeyDown}
        >
            <Checkbox
                onChange={this._toggleWiState}
                ariaLabel="Completed"
                checked={metastate === "Completed"}
                className="checkbox"
                tabIndex={-1}
                data-is-focusable={false}
            />
            <a className={`link-label ${metastate}`} href={this._getLink()}
                tabIndex={-1}
                data-is-focusable={false}
                onClick={(e) => {
                    const { navService } = this.props.link;
                    navService.openNewWindow(this._getLink(), "");
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                {wi.fields["System.Title"]}
            </a>
            <IconButton
                iconProps={ {
                    iconName: "More",
                    title: "More Options",
                } }
                tabIndex={-1}
                data-is-focusable={false}
                split={false}
                className="link-options"
                menuProps={{
                    items: [
                        {
                            key: "Delete",
                            icon: "Delete",
                            name: "Delete",
                            onClick: (e) => {
                                deleteWi(wi);
                                e.preventDefault();
                                e.stopPropagation();
                            },
                        },
                    ],
                    isBeakVisible: false,
                }}
            />
        </div>;
    }
    private _getLink() {
        const { wi } = this.props.link;
        const uri = VSS.getWebContext().host.uri;
        const project = wi.fields["System.TeamProject"];
        const wiUrl = `${uri}${project}/_workitems?id=${wi.id}&_a=edit&fullScreen=true`;
        return wiUrl;
    }

    @autobind
    private _toggleWiState() {
        const { wi, metastate } = this.props.link;

        const altState: MetaState = metastate === "Completed" ? "Proposed" : "Completed";
        updateWiState(wi, altState);
    }

    @autobind
    private _onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        const { navService, wi } = this.props.link;
        if (e.keyCode === KeyCode.ENTER) {
            navService.openNewWindow(this._getLink(), "");
            e.preventDefault();
            e.stopPropagation();
        } else if (e.keyCode === KeyCode.SPACE) {
            this._toggleWiState();
        } else if (e.keyCode === KeyCode.DELETE) {
            deleteWi(wi);
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

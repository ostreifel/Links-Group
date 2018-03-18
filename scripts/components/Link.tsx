import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { MetaState } from "../backlogConfiguration";
import { titleField } from "../fieldConstants";
import { deleteWi, renameChild, updateWiState } from "../linksManager";
import { IWorkItemLink } from "./IWorkItemLink";

interface ILinkState {
    editingTitle?: boolean;
}

export class Link extends React.Component<{link: IWorkItemLink}, ILinkState> {
    private linkRef: HTMLDivElement;
    constructor(props, context) {
        super(props, context);
        this.state = {};
    }
    public render() {
        const {wi, metastate } = this.props.link;
        const { editingTitle } = this.state;

        return <div
            className="link"
            tabIndex={0}
            data-is-focusable={true}
            onKeyDown={this._onLinkKeyDown}
            ref={(linkRef) => this.linkRef = linkRef}
        >
            <Checkbox
                onChange={this._toggleWiState}
                ariaLabel="Completed"
                checked={metastate === "Completed"}
                className="checkbox"
                tabIndex={-1}
                data-is-focusable={false}
            />
            {
                editingTitle ?
                <TextField
                    onBlur={this._onTitleEditBlur}
                    onKeyDown={this._onTitleEditKeyDown}
                    value={wi.fields[titleField]}
                    className="link-edit"
                    autoFocus={true}
                    onFocus={(e) => e.currentTarget.select()}
                />
                :
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
            }
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
    public componentDidUpdate() {
        if (this.state.editingTitle === false) {
            this.linkRef.focus();
        }
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
    private _onLinkKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
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
        } else if (e.keyCode === KeyCode.F2) {
            this.setState({editingTitle: true});
        }
    }

    @autobind
    private async _onTitleEditBlur(e: React.FocusEvent<HTMLInputElement>) {
        const newTitle = e.currentTarget.value;
        const oldTitle = this.props.link.wi.fields[titleField];
        if (newTitle && newTitle !== oldTitle && this.state.editingTitle) {
            await renameChild(this.props.link.wi, e.currentTarget.value);
        }
        this.setState({editingTitle: false});
    }

    @autobind
    private async _onTitleEditKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.keyCode === KeyCode.ENTER && e.currentTarget.value) {
            e.stopPropagation();
            e.preventDefault();
            await renameChild(this.props.link.wi, e.currentTarget.value);
            this.setState({editingTitle: false});
        } else if (e.keyCode === KeyCode.ESCAPE) {
            e.stopPropagation();
            e.preventDefault();
            this.setState({editingTitle: false});
        }
    }
}

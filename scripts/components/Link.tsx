import { IconButton } from "office-ui-fabric-react/lib/Button";
import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { MetaState } from "../backlogConfiguration";
import { titleField } from "../fieldConstants";
import { deleteWi, moveChild, renameChild, unlink, updateWiState } from "../linksManager";
import { IWorkItemLink } from "./IWorkItemLink";

interface ILinkState {
    editingTitle?: boolean;
}

export interface ILinkProps {
    link: IWorkItemLink;
    selected: number;
}

export class Link extends React.Component<ILinkProps, ILinkState> {
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
            draggable={true}
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
            <div className="label-container">
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
                        draggable={false}
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
            </div>
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
                            icon: "RecycleBin",
                            name: "Delete (del)",
                            title: "Go to the recycling bin to undo",
                            onClick: (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                deleteWi(wi);
                            },
                        },
                        {
                            key: "Unlink",
                            icon: "RemoveLink",
                            name: "Unlink (ctr + u)",
                            onClick: (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                unlink(this.props.link);
                            },
                        },
                        {
                            key: "Rename",
                            icon: "Rename",
                            name: "Rename (f2)",
                            onClick: () => {
                                this.setState({editingTitle: true});
                            },
                        },
                    ],
                    isBeakVisible: false,
                }}
            />
        </div>;
    }
    public componentDidUpdate(_, prevState) {
        if (
            (this.props.selected === this.props.link.wi.id && !this.state.editingTitle) ||
            (prevState.editingTitle && !this.state.editingTitle)
        ) {
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
        if (e.target instanceof HTMLInputElement) {
            return;
        }
        const { navService, wi } = this.props.link;
        if (e.keyCode === KeyCode.ENTER) {
            e.stopPropagation();
            e.preventDefault();
            navService.openNewWindow(this._getLink(), "");
        } else if (e.keyCode === KeyCode.SPACE) {
            e.stopPropagation();
            e.preventDefault();
            this._toggleWiState();
        } else if (e.keyCode === KeyCode.DELETE) {
            e.stopPropagation();
            e.preventDefault();
            deleteWi(wi);
        } else if (String.fromCharCode(e.keyCode).toUpperCase() === "U" && e.ctrlKey) {
            e.stopPropagation();
            e.preventDefault();
            unlink(this.props.link);
        } else if (e.keyCode === KeyCode.F2) {
            e.stopPropagation();
            e.preventDefault();
            this.setState({editingTitle: true});
        } else if (e.keyCode === KeyCode.DOWN && e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            moveChild(this.props.link, "down");
        } else if (e.keyCode === KeyCode.UP && e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            moveChild(this.props.link, "up");
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

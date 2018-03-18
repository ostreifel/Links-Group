import { ActionButton    } from "office-ui-fabric-react/lib/Button";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { createChildWi } from "../linksManager";

interface IAddLinkState {
    addingChild?: boolean;
    focusButton?: boolean;
}

export class AddLink extends React.Component<{}, IAddLinkState> {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    }
    public render() {
        const { addingChild, focusButton } = this.state;
        if (!addingChild) {
            return <ActionButton
                onClick={() => this.setState({addingChild: true})}
                className="add-button"
                autoFocus={focusButton}
                iconProps={ {
                    iconName: "Add",
                    title: "Add child work item",
                } }
            >Add Child</ActionButton>;
        }
        return <TextField
            className="add-title"
            placeholder="Enter title"
            onKeyDown={this._keyDown}
            onBlur={this._onBlur}
            autoFocus={true}
        />;
    }

    @autobind
    private async _onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (e.currentTarget.value) {
            await createChildWi(e.currentTarget.value);
        }
        this.setState({addingChild: false, focusButton: true});
    }

    @autobind
    private async _keyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (e.keyCode === KeyCode.ESCAPE) {
            this.setState({addingChild: false, focusButton: true});
        } else if (e.keyCode === KeyCode.ENTER) {
            await createChildWi(e.currentTarget.value);
            this.setState({addingChild: false, focusButton: true});
        }
    }
}

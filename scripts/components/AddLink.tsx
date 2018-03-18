import { IconButton } from "office-ui-fabric-react/lib/Button";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";

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
            return <IconButton
                iconProps={ {
                    iconName: "Add",
                    title: "Add child work item",
                } }
                onClick={() => this.setState({addingChild: true})}
                className="add-button"
                autoFocus={focusButton}
            />;
        }
        return <TextField
            className="add-title"
            placeholder="Enter workitem title"
            onKeyDown={this._keyDown}
            onBlur={() => this.setState({addingChild: false, focusButton: true})}
            autoFocus={true}
        />;
    }

    @autobind
    public _keyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (e.keyCode === KeyCode.ESCAPE) {
            this.setState({addingChild: false, focusButton: true});
        }
    }
}

import { ActionButton } from "office-ui-fabric-react/lib/Button";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import * as React from "react";
import { KeyCode } from "VSS/Utils/UI";
import { createChildWi } from "../linksManager";

interface IAddLinkState {
    addingChild?: boolean;
    focusButton?: boolean;
}

export class AddLink extends React.Component<{}, IAddLinkState> {
    constructor(props: {}, context?: any) {
        super(props, context);
        this.state = {};
    }

    public render() {
        const { addingChild, focusButton } = this.state;

        if (!addingChild) {
            return (
                <ActionButton
                    className="add-button"
                    autoFocus={focusButton}
                    iconProps={{
                        iconName: "Add",
                        title: "Add child work item",
                    }}
                    onClick={this.onAddClick}
                >
                    Add Child
                </ActionButton>
            );
        }

        return (
            <TextField
                autoFocus={true}
                placeholder="Enter child title"
                onBlur={this.onBlur}
                onKeyDown={this.keyDown}
            />
        );
    }

    private onAddClick = () => {
        this.setState({addingChild: true, focusButton: false});
    }

    private onBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = (e.currentTarget.value || "").trim();

        if (value) {
            await createChildWi(e.type, value);
        }

        this.setState({addingChild: false, focusButton: true});
    }

    private keyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = (e.currentTarget.value || "").trim();

        if (e.keyCode === KeyCode.ESCAPE) {
            e.preventDefault();
            e.stopPropagation();
            this.setState({addingChild: false, focusButton: true});
            return;
        }

        if (e.keyCode === KeyCode.ENTER) {
            e.preventDefault();
            e.stopPropagation();

            if (value) {
                await createChildWi(e.type, value);
            }

            this.setState({addingChild: false, focusButton: true});
        }
    }
}

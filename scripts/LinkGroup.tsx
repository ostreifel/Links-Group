import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItem, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { updateWiState } from "./linksManager";

class Link extends React.Component<{link: IWorkItemLink}, {}> {
    public render() {
        const {wi} = this.props.link;
        return <div>
            <Checkbox
                onChange={ () => updateWiState(wi, "Completed") }
                ariaLabel="Completed"
            />
            {wi.fields["System.Title"]}
        </div>;
    }
}

class Links extends React.Component<{links: IWorkItemLink[]}, {}> {
    public render() {
        return <div>
            {this.props.links.map((lk) => <Link link={lk} />)}
        </div>;
    }
}

export interface IWorkItemLink {
    wi: WorkItem;
    link: WorkItemRelation;
}

export function renderLinks(links: IWorkItemLink[]): void {
    ReactDOM.render(<Links links={links}/>, document.getElementById("links-container"), () => VSS.resize());
}

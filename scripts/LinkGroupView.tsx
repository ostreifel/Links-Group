import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItem, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { MetaState } from "./backlogConfiguration";
import { updateWiState } from "./linksManager";

class Link extends React.Component<{link: IWorkItemLink}, {}> {
    public render() {
        const {wi, metastate } = this.props.link;
        const altState: MetaState = metastate === "Completed" ? "Proposed" : "Completed";
        return <div className="link">
            <Checkbox
                onChange={ () => updateWiState(wi, altState) }
                ariaLabel="Completed"
                defaultChecked={metastate === "Completed"}
            />
            <div className="link-label">
                {wi.fields["System.Title"]}
            </div>
        </div>;
    }
}

class Links extends React.Component<{links: IWorkItemLink[]}, {}> {
    public render() {
        return <div className="links">
            {this.props.links.map((lk) => <Link link={lk} />)}
        </div>;
    }
}

export interface IWorkItemLink {
    wi: WorkItem;
    link: WorkItemRelation;
    metastate: MetaState;
}

export function renderLinks(links: IWorkItemLink[]): void {
    ReactDOM.render(<Links links={links}/>, document.getElementById("links-container"), () => VSS.resize());
}

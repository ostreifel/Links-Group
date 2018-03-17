import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItem, WorkItemRelation } from "TFS/WorkItemTracking/Contracts";
import { HostNavigationService } from "VSS/SDK/Services/Navigation";
import { MetaState } from "./backlogConfiguration";
import { updateWiState } from "./linksManager";

let navService: HostNavigationService;
class Link extends React.Component<{link: IWorkItemLink}, {}> {
    public render() {
        const {wi, metastate } = this.props.link;

        const uri = VSS.getWebContext().host.uri;
        const project = wi.fields["System.TeamProject"];
        const wiUrl = `${uri}${project}/_workitems?id=${wi.id}&_a=edit&fullScreen=true`;

        const altState: MetaState = metastate === "Completed" ? "Proposed" : "Completed";
        return <div className="link">
            <Checkbox
                onChange={ () => updateWiState(wi, altState) }
                ariaLabel="Completed"
                checked={metastate === "Completed"}
            />
            <a className={`link-label ${metastate}`} href={wiUrl} onClick={(e) => {
                navService.openNewWindow(wiUrl, "");
                e.preventDefault();
                e.stopPropagation();
            }}>
                {wi.fields["System.Title"]}
            </a>
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

export async function renderLinks(links: IWorkItemLink[]) {
    if (!navService) {
        navService = await VSS.getService(VSS.ServiceIds.Navigation) as HostNavigationService;
    }
    ReactDOM.render(<Links links={links}/>, document.getElementById("links-container"), () => VSS.resize());
}

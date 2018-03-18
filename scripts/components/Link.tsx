import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import * as React from "react";
import { MetaState } from "../backlogConfiguration";
import { updateWiState } from "../linksManager";
import { IWorkItemLink } from "./IWorkItemLink";

export class Link extends React.Component<{link: IWorkItemLink}, {}> {
    public render() {
        const {wi, metastate, navService } = this.props.link;

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
            <a className={`link-label ${metastate}`} href={wiUrl}
                onClick={(e) => {
                    navService.openNewWindow(wiUrl, "");
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                {wi.fields["System.Title"]}
            </a>
        </div>;
    }
}

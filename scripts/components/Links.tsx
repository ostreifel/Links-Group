import { FocusZone, FocusZoneDirection } from "office-ui-fabric-react/lib/components/FocusZone";
import * as React from "react";
import { AddLink } from "./AddLink";
import { IWorkItemLink } from "./IWorkItemLink";
import { Link } from "./Link";

export interface ILinkProps {
    links: IWorkItemLink[];
    selected: number;
}

export class Links extends React.Component<ILinkProps, {}> {
    public render() {
        return <FocusZone
            className="links"
            direction={FocusZoneDirection.vertical}
        >
            {this.props.links.map((lk) => <Link link={lk} selected={this.props.selected} />)}
            <AddLink />
        </FocusZone>;
    }
}

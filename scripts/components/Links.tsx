import { FocusZone, FocusZoneDirection } from "office-ui-fabric-react/lib/components/FocusZone";
import * as React from "react";
import { AddLink } from "./AddLink";
import { IWorkItemLink } from "./IWorkItemLink";
import { Link } from "./Link";

export class Links extends React.Component<{links: IWorkItemLink[]}, {}> {
    public render() {
        return <FocusZone
            className="links"
            direction={FocusZoneDirection.vertical}
        >
            {this.props.links.map((lk) => <Link link={lk} />)}
            <AddLink />
        </FocusZone>;
    }
}

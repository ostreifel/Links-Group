import * as React from "react";
import { AddLink } from "./AddLink";
import { IWorkItemLink } from "./IWorkItemLink";
import { Link } from "./Link";

export class Links extends React.Component<{links: IWorkItemLink[]}, {}> {
    public render() {
        return <div className="links">
            {this.props.links.map((lk) => <Link link={lk} />)}
            <AddLink />
        </div>;
    }
}

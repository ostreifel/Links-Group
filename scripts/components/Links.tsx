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
        return <div className="links">
            {this.props.links.map((lk) => <Link link={lk} selected={this.props.selected} />)}
            <AddLink />
        </div>;
    }
}

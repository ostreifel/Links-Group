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
        return (
            <div className="links">
                <AddLink />
                {this.props.links.map((lk) => (
                    <Link
                        key={lk.wi.id}
                        link={lk}
                        selected={this.props.selected}
                    />
                ))}
            </div>
        );
    }
}

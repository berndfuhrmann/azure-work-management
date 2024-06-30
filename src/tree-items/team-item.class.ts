import { WebApiTeam } from 'azure-devops-node-api/interfaces/CoreInterfaces';
import { MarkdownString, TreeItemCollapsibleState } from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class TeamItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<WebApiTeam, ParentItem | undefined> {
	constructor(
		item: WebApiTeam,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'team');
		this.tooltip = new MarkdownString()
		.appendText(item.description ?? '');
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'users';
	}

	getRepositoryId(): string {
		return this.item.id!;
	}

	getId() {
		return this.item.id!;
	}
}

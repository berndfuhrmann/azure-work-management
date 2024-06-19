import { BacklogLevelConfiguration } from 'azure-devops-node-api/interfaces/WorkInterfaces';
import * as path from 'path';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class BacklogItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<BacklogLevelConfiguration, ParentItem | undefined> {
	constructor(
		item: BacklogLevelConfiguration,
		parent: ParentItem | undefined,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, 'backlog');
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'backlog';
	}

	getBacklogID(): string {
		return this.item.id!;
	}

	getBacklog(): BacklogLevelConfiguration {
		return this.item;
	}
}

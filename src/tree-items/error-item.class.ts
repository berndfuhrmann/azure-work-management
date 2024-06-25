import { BacklogLevelConfiguration } from 'azure-devops-node-api/interfaces/WorkInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';
import { randomUUID } from 'crypto';

export class ErrorItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<BacklogLevelConfiguration, ParentItem | undefined> {
	constructor(
		item: any,
		parent: ParentItem | undefined,
		viewId: string,
	) {
		super(item, parent, viewId, 'error');
		if (item instanceof Error) {
			this.tooltip = item.message+"\n"+item.stack;
		}
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return vscode.TreeItemCollapsibleState.None;
	}

	getIconName(): string {
		return 'circle-x';
	}

	getId() {
		return randomUUID();
	}
}

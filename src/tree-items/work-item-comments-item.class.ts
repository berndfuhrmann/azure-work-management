import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class WorkItemCommentsItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<WorkItem, ParentItem | undefined> {
	constructor(
		item: WorkItem,
		parent: ParentItem | undefined,
		viewId: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'workItemComments');
	}

	getName() {
		return `${this.item.id}: ${this.item.fields!['System.Title']}`;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'message-dots';
	}

	getWorkItemID(): number {
		return this.item.id!;
	}

	getWorkItemRev(): number {
		return this.item.rev!;
	}

	getBoardColumnFieldName(): string {
		const fields: string[] = Object.keys(this.item.fields!);
		for (let field of fields) {
			if (field.endsWith('_Kanban.Column')) {
				return field;
			}
		}

		return '';
	}

	private removeTags(str: string): string {
		if (!str) {
			return '';
		}

		return str.replace(/(<([^>]+)>)/gi, '');
	}
	
	getId() {
		return `${this.item.id}`;
	}
}

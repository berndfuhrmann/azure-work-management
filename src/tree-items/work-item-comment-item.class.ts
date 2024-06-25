import { Comment } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class WorkItemCommentItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<Comment, ParentItem | undefined> {
	constructor(
		item: Comment,
		parent: ParentItem | undefined,
		viewId: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'workItemComment');
		this.tooltip = new vscode.MarkdownString().appendMarkdown(item.text ?? '');
		this.tooltip.supportHtml = true;
	}

	getName() {
		return `${this.item.createdBy?.displayName} - ${this.item.createdDate}`;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'message-dots';
	}

	getId() {
		return `${this.item.workItemId}-${this.item.id}`;
	}
}

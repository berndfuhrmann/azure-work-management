import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';
import { removeTags } from '../utils/stringUtils';

export class WorkItemItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<WorkItem, ParentItem | undefined> {
	contextValue = 'workItem';

	constructor(
		item: WorkItem,
		parent: ParentItem | undefined,
		viewId: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'workItem');

		this.tooltip = new vscode.MarkdownString()
			.appendText('Assigned to:')
			.appendMarkdown(` == ${item.fields!['System.AssignedTo']?.displayName || 'Unassigned'} == `)
			.appendText('\n')
			.appendText(item.fields!['System.Description']

				? '\n' + removeTags(item.fields!['System.Description'])
				: '');
		
		this.resourceUri = vscode.Uri.parse(item.url!);
	}

	getName() {
		return `${this.item.id}: ${this.item.fields!['System.Title']}`;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		const icons: Record<string, string> = {
			default: 'user-story-work-item',
			'User Story': 'user-story-work-item',
			Bug: 'bug-work-item',
			Task: 'task-work-item',
			Epic: 'epic-work-item',
			Feature: 'feature-work-item',
			Project: 'project-work-item',
		};

		const workItemType: string = this.item.fields!['System.WorkItemType'];
		return icons[workItemType] || icons['default'];
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


	
	getId() {
		return `${this.item.id}`;
	}
}

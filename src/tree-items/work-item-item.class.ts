import { BoardColumn } from 'azure-devops-node-api/interfaces/WorkInterfaces';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as path from 'path';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class WorkItemItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<WorkItem, ParentItem | undefined> {
	contextValue = 'workItem';

	command = {
		title: 'Open Work Item',
		command: 'azure-work-management.open-work-item',
		arguments: [this],
	};

	constructor(
		item: WorkItem,
		parent: ParentItem | undefined,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, 'workItem');

		this.tooltip = `Assigned to: ${item.fields!['System.AssignedTo']?.displayName || 'Unassigned'}\n${
			item.fields!['System.Description']
				? '\n' + this.removeTags(item.fields!['System.Description'])
				: ''
		}`;
	}

	getName() {
		return `${this.item.id}: ${this.item.fields!['System.Title']}`;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		const icons: { [key: string]: string } = {
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

	private removeTags(str: string): string {
		if (!str) {
			return '';
		}

		return str.replace(/(<([^>]+)>)/gi, '');
	}
}

import { BoardColumn } from 'azure-devops-node-api/interfaces/WorkInterfaces';
import * as vscode from 'vscode';
import { BoardItem } from '../tree-items/board-item.class';
import { AbstractItem } from './abstract-item.class';

export class ColumnItem extends AbstractItem<BoardColumn, BoardItem<any>> {
	constructor(
		item: BoardColumn,
		parent: BoardItem<any>,
		viewId: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'column');
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'board-column';
	}

	getAllowedWorkItemTypes(): string[] {
		return Object.keys(this.item.stateMappings!);
	}

	getId() {
		return this.item.id!;
	}
}

import { BoardColumn } from 'azure-devops-node-api/interfaces/WorkInterfaces';
import * as vscode from 'vscode';
import { BoardItem } from '../tree-items/board-item.class';
import { AbstractItem } from './abstract-item.class';

export class ColumnItem extends AbstractItem<BoardColumn, BoardItem<any>> {
	constructor(
		item: BoardColumn,
		parent: BoardItem<any>,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, 'column');
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

	getColumnID(): string {
		return this.item.id!;
	}

	getColumnName(): string {
		return this.item.name!;
	}

	getAllowedWorkItemTypes(): string[] {
		return Object.keys(this.item.stateMappings!);
	}
}

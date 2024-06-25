import {
	Board,
	BoardColumn,
} from 'azure-devops-node-api/interfaces/WorkInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class BoardItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<Board, ParentItem | undefined> {
	private _columns: BoardColumn[] = [];

	constructor(
		private _board: Board,
		parent: ParentItem | undefined,
		viewId: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(_board, parent, viewId, 'board');
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'board';
	}

	getId() {
		return this.item.id!;
	}
}

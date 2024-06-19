import * as path from 'path';
import * as vscode from 'vscode';
import {
	Board,
	BoardColumn,
} from 'azure-devops-node-api/interfaces/WorkInterfaces';
import { AbstractItem } from './abstract-item.class';

export class BoardItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<Board, ParentItem | undefined> {
	private _columns: BoardColumn[] = [];

	constructor(
		private _board: Board,
		parent: ParentItem | undefined,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(_board, parent, 'board');
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

	getBoardID(): string {
		return this._board.id!;
	}

	setColumns(columns: BoardColumn[]): void {
		this._columns = columns;
	}

	getColumns(): BoardColumn[] {
		return this._columns;
	}

	getBoard(): Board {
		return this._board;
	}
}

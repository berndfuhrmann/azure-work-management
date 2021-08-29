import * as path from 'path';
import * as vscode from 'vscode';
import { Column } from '../../api/types';

export class ColumnItem extends vscode.TreeItem {
	contextValue = 'column';

	iconPath = path.join(__filename, '..', '..', 'src', 'resources', 'board-column.svg');

	constructor(private _column: Column, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
		super(_column.name, collapsibleState);
	}

	getColumnID(): string {
		return this._column.id;
	}

	getColumnName(): string {
		return this._column.name;
	}
}
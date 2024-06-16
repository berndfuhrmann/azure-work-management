import { BoardColumn } from 'azure-devops-node-api/interfaces/WorkInterfaces';
import * as vscode from 'vscode';
import { BoardService } from '../api/services/board.service';
import { TeamFieldValue } from '../api/types/team-field-values.type';

import { WorkItemService } from '../api/services/work-item.service';
import { AppSettingsService } from '../services/app-settings.service';
import { BoardItem } from '../tree-items/board-item.class';
import { ColumnItem } from '../tree-items/column-item.class';
import { WorkItemItem } from '../tree-items/work-item-item.class';
import { AbstractTreeProvider } from './abstract-tree-provider';

export class BoardsTreeProvider
	extends AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>
{
	constructor(
		private _context: vscode.ExtensionContext,
		_appSettingsService: AppSettingsService,
		private _boardService: BoardService,
		private _workItemService: WorkItemService,
	) {
		super(_appSettingsService);
		this.getChildrenForContext.set('default', (_element) => this.getBoards());
		this.getChildrenForContext.set('board', (element) =>
			this.getColumns(element as BoardItem),
		);
		this.getChildrenForContext.set('column', (element) =>
			this.getWorkItems(element as ColumnItem),
		);
		this.getChildrenForContext.set('workItem', () => Promise.resolve([]));
	}

	private async getBoards(): Promise<BoardItem[]> {
		const boards = await this._boardService.getAll();
		return boards.map((board) => {
			return new BoardItem(board, vscode.TreeItemCollapsibleState.Collapsed);
		});
	}

	private async getColumns(element: BoardItem) {
		const columns = await this._boardService.getColumns(element.getBoardID());
		element.setColumns(columns);

		return columns.map((column) => {
			return new ColumnItem(
				element,
				column,
				vscode.TreeItemCollapsibleState.Collapsed,
			);
		});
	}

	private async getWorkItems(element: ColumnItem) {
		const iterationPath: string = this._appSettingsService.getIteration();
		const systemAreaPaths: TeamFieldValue[] = JSON.parse(
			this._context.globalState.get('system-area-path') as string,
		);
		const boardColumn: string = element.getColumnName();
		const columns: BoardColumn[] = element.getBoardItem().getColumns();
		const workItemTypes: string[] = element.getAllowedWorkItemTypes();
		const workItems = await this._workItemService.queryForWorkItems(
			iterationPath,
			systemAreaPaths,
			boardColumn,
			workItemTypes,
		);

		return workItems.map(
			(workItem) =>
				new WorkItemItem(
					workItem,
					columns,
					vscode.TreeItemCollapsibleState.None,
				),
		);
	}
}

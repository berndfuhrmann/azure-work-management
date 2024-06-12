import { BoardColumn } from 'azure-devops-node-api/interfaces/WorkInterfaces';
import * as vscode from 'vscode';
import { TeamFieldValue } from '../api';
import { BoardService, WorkItemService } from '../api/services';
import { getAppSettings } from '../services';
import { BoardItem } from '../tree-items/board-item.class';
import { ColumnItem } from '../tree-items/column-item.class';
import { WorkItemItem } from '../tree-items/work-item-item.class';
import { AbstractTreeProvider } from './abstract-tree-provider';

export class BoardsTreeProvider extends AbstractTreeProvider {
	constructor(
		context: vscode.ExtensionContext,
		private _boardService: BoardService,
		private _workItemService: WorkItemService,
	) {
		super(context);
		this.getChildrenForContext.set(AbstractTreeProvider.defaultKey, () =>
			this.getBoards(),
		);
		this.getChildrenForContext.set('board', (element) =>
			this.getColumns(element as BoardItem),
		);
		this.getChildrenForContext.set('column', (element) =>
			this.getWorkItems(element as ColumnItem),
		);
		this.getChildrenForContext.set('workItem', () => []);
	}

	private async getBoards(): Promise<BoardItem[]> {
		const boards = await this._boardService.getAll();
		return boards.map(
			(board) =>
				new BoardItem(board, vscode.TreeItemCollapsibleState.Collapsed),
		);
	}

	private async getColumns(element: BoardItem) {
		const columns = await this._boardService.getColumns(element.getBoardID());
		element.setColumns(columns);

		return columns.map(
			(column) =>
				new ColumnItem(
					element,
					column,
					vscode.TreeItemCollapsibleState.Collapsed,
				),
		);
	}

	private async getWorkItems(element: ColumnItem) {
		const iterationPath: string = getAppSettings().get('iteration') as string;
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

import * as vscode from 'vscode';
import { BacklogService } from '../api';
import { BacklogItem } from '../tree-items/backlog-item.class';
import { WorkItemItem } from '../tree-items/work-item-item.class';
import { AbstractTreeProvider } from './abstract-tree-provider';

export class BacklogTreeProvider extends AbstractTreeProvider {
	constructor(
		context: vscode.ExtensionContext,
		private _backlogService: BacklogService,
	) {
		super(context);
		this.getChildrenForContext.set(AbstractTreeProvider.defaultKey, () =>
			this.getBacklogs(),
		);
		this.getChildrenForContext.set('backlog', (element) =>
			this.getWorkItems(element as BacklogItem),
		);
		this.getChildrenForContext.set('workItem', () => []);
	}

	private async getBacklogs() {
		const backlogs = await this._backlogService.getBacklogs();
		return backlogs.map(
			(backlog) =>
				new BacklogItem(backlog, vscode.TreeItemCollapsibleState.Collapsed),
		);
	}

	private async getWorkItems(element: BacklogItem) {
		const backlogID: string = element.getBacklogID();
		const workItems = await this._backlogService.getBacklogWorkItems(backlogID);

		return workItems.map(
			(workItem) =>
				new WorkItemItem(workItem, [], vscode.TreeItemCollapsibleState.None),
		);
	}
}

import * as vscode from 'vscode';
import { BacklogService } from '../api/services/backlog.service';
import { AppSettingsService } from '../services/app-settings.service';
import { BacklogItem } from '../tree-items/backlog-item.class';
import { WorkItemItem } from '../tree-items/work-item-item.class';
import { AbstractTreeProvider } from './abstract-tree-provider';

export class BacklogTreeProvider
	extends AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>
{
	constructor(
		_context: vscode.ExtensionContext,
		_appSettingsService: AppSettingsService,
		private _backlogService: BacklogService,
	) {
		super(_appSettingsService);
		this.getChildrenForContext.set('default', this.getBacklogs.bind(this));
		this.getChildrenForContext.set(
			'backlog',
			(element: vscode.TreeItem | undefined) =>
				this.getWorkItems(element as BacklogItem),
		);
		this.getChildrenForContext.set('workItem', () => Promise.resolve([]));
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

		return workItems.map((workItem) => {
			return new WorkItemItem(
				workItem,
				[],
				vscode.TreeItemCollapsibleState.None,
			);
		});
	}
}

import * as vscode from 'vscode';
import { BacklogService } from '../api/services/backlog.service';
import { WorkItemService } from '../api/services/work-item.service';
import { AppSettingsService } from '../services/app-settings.service';
import { BacklogItem } from '../tree-items/backlog-item.class';
import { WorkItemItem } from '../tree-items/work-item-item.class';
import { AbstractTreeProvider } from './abstract-tree.provider';
import { WorkItemPartTreeProvider } from './work-item';

export class BacklogTreeProvider
	extends AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>
{
	constructor(
		_context: vscode.ExtensionContext,
		_appSettingsService: AppSettingsService,
		private _backlogService: BacklogService,
		_workItemService: WorkItemService,
	) {
		super(_appSettingsService);
		const workItemPartTreeProvider = new WorkItemPartTreeProvider(
			_workItemService,
		);
		workItemPartTreeProvider.add(this.getChildrenForContext);
		this.getChildrenForContext.set('default', this.getBacklogs.bind(this));
		this.getChildrenForContext.set(
			'backlog',
			(element: vscode.TreeItem | undefined) =>
				this.getWorkItems(element as BacklogItem<any>),
		);
	}

	private async getBacklogs() {
		const backlogs = await this._backlogService.getBacklogs();
		return backlogs.map(
			(backlog) =>
				new BacklogItem(
					backlog,
					undefined,
					this.constructor.name,
					vscode.TreeItemCollapsibleState.Collapsed,
				),
		);
	}

	private async getWorkItems(element: BacklogItem<any>) {
		const backlogID: string = element.getBacklogID();
		const workItems = await this._backlogService.getBacklogWorkItems(backlogID);

		return workItems.map((workItem) => {
			return new WorkItemItem(
				workItem,
				element,
				this.constructor.name,
				vscode.TreeItemCollapsibleState.Collapsed,
			);
		});
	}
}

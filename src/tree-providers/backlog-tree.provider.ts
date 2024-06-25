import * as vscode from 'vscode';
import { BacklogService } from '../api/services/backlog.service';
import { AppSettingsService } from '../services/app-settings.service';
import { BacklogItem } from '../tree-items/backlog-item.class';
import { WorkItemItem } from '../tree-items/work-item-item.class';
import { AbstractTreeProvider } from './abstract-tree.provider';
import { WorkItemCommentsItem } from '../tree-items/work-item-comments-item.class';

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
				this.getWorkItems(element as BacklogItem<any>),
		);
		this.getChildrenForContext.set(
			'workItem', 
			(element: vscode.TreeItem | undefined) => 
				this.getWorkItemChildren(element as WorkItemItem<any>),
		);
		this.getChildrenForContext.set(
			'workItemComments', 
			(element: vscode.TreeItem | undefined) => 
				this.getWorkItemComments(element as WorkItemCommentsItem<any>),
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

	private async getWorkItemChildren(element: WorkItemItem<any>) {
		return [
			new WorkItemCommentsItem(element.item, element, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed)
		];
	}

	private async getWorkItemComments(element: WorkItemCommentsItem<any>) {
		return [];
		/*return workItems.map((workItem) => {
			return new WorkItemItem(
				workItem,
				element,
				this.constructor.name,
				vscode.TreeItemCollapsibleState.Collapsed,
			);
		});*/
	}
}

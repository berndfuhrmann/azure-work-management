import * as vscode from 'vscode';
import { GitService } from '../api/services/git.service';
import { AppSettingsService } from '../services/app-settings.service';
import { RepositoryBranchItem } from '../tree-items/repository-branch-item.class';
import { RepositoryBranchesItem } from '../tree-items/repository-branches-item.class';
import { RepositoryItem } from '../tree-items/repository-item.class';
import { RepositoryPullRequestItem } from '../tree-items/repository-pull-request-item.class';
import { RepositoryPullRequestsItem } from '../tree-items/repository-pull-requests-item.class';
import { AbstractTreeProvider } from './abstract-tree.provider';
import { WorkItemPartTreeProvider } from './work-item';
import { WorkItemService } from '../api/services/work-item.service';
import { from, map, startWith } from 'rxjs';

export class GitTreeProvider
	extends AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>
{
	constructor(
		_context: vscode.ExtensionContext,
		_appSettingsService: AppSettingsService,
		private _gitService: GitService,
		_workItemService: WorkItemService,
	) {
		super(_appSettingsService);
		const workItemPartTreeProvider = new WorkItemPartTreeProvider(
			_workItemService,
		);
		workItemPartTreeProvider.add(this.getChildrenForContext);

		this.getChildrenForContext.set(
			'default',
			() => from(this.getGitRepositories()),
		);
		this.getChildrenForContext.set(
			'repository',
			(element: vscode.TreeItem | undefined) =>
				from(this.getRepositoryItems(element as RepositoryItem<any>)),
		);
		this.getChildrenForContext.set(
			'repository-branches',
			(element: vscode.TreeItem | undefined) =>
				from(this.getRepositoryBranches(element as RepositoryBranchesItem<any>)),
		);
		this.getChildrenForContext.set(
			'repository-pull-requests',
			(element: vscode.TreeItem | undefined) =>
				from(this.getRepositoryPullRequests(element as RepositoryBranchesItem<any>)),
		);
	}

	private getGitRepositories() {
		return from(this._gitService.getAll()).pipe(
			map(gitRepositories => gitRepositories.map((gitRepository) =>
				new RepositoryItem(
					gitRepository,
					undefined,
					this.constructor.name,
					vscode.TreeItemCollapsibleState.Collapsed,
				))),
				startWith([new vscode.TreeItem('random')])
		);
	}

	private async getRepositoryItems(element: RepositoryItem<any>) {
		return [
			new RepositoryBranchesItem(
				element.item,
				element,
				this.constructor.name,
				vscode.TreeItemCollapsibleState.Collapsed,
			),
			new RepositoryPullRequestsItem(
				element.item,
				element,
				this.constructor.name,
				vscode.TreeItemCollapsibleState.Collapsed,
			),
		];
	}

	private async getRepositoryBranches(element: RepositoryBranchesItem<any>) {
		const branches = this._gitService.getBranches(element.getRepositoryId());
		return (await branches).map(
			(branch) =>
				new RepositoryBranchItem(
					branch,
					element,
					this.constructor.name,
					vscode.TreeItemCollapsibleState.None,
				),
		);
	}

	private async getRepositoryPullRequests(
		element: RepositoryPullRequestsItem<any>,
	) {
		const pullRequests = this._gitService.getPullRequests(
			element.getRepositoryId(),
		);
		return (await pullRequests).map(
			(pullRequest) =>
				new RepositoryPullRequestItem(
					pullRequest,
					element,
					this.constructor.name,
					vscode.TreeItemCollapsibleState.None,
				),
		);
	}

	private static readonly pullRequestMergeStatusColors = {
		'0': undefined, //new vscode.ThemeColor('list.errorForeground'),
		'1': new vscode.ThemeColor('list.errorForeground'),
		'2': new vscode.ThemeColor('list.warningForeground'),
		'3': undefined, //new vscode.ThemeColor('list.errorForeground'),
		'4': new vscode.ThemeColor('list.errorForeground'),
		'5': new vscode.ThemeColor('list.errorForeground'),
	};

	public provideDecoration(
		category: string,
		query: Record<string, (string | boolean)[]>,
		uri: vscode.Uri,
		token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.FileDecoration> {
		switch (category) {
			case 'repository-pullrequest':
				const index = query['mergeStatus'][0] as
					| '0'
					| '1'
					| '2'
					| '3'
					| '4'
					| '5';
				const color = GitTreeProvider.pullRequestMergeStatusColors[index];
				if (color) {
					return {
						badge: '#',
						color,
						tooltip: '',
					};
				}
				break;
		}
		return undefined;
	}
}

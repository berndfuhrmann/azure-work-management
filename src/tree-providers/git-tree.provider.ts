import * as vscode from 'vscode';
import { GitService } from '../api/services/git.service';
import { AppSettingsService } from '../services/app-settings.service';
import { RepositoryItem } from '../tree-items/repository-item.class';
import { AbstractTreeProvider } from './abstract-tree.provider';
import { RepositoryBranchesItem } from '../tree-items/repository-branches-item.class';
import { RepositoryPullRequestsItem } from '../tree-items/repository-pull-requests-item.class';
import { RepositoryBranchItem } from '../tree-items/repository-branch-item.class';
import { RepositoryPullRequestItem } from '../tree-items/repository-pull-request-item.class';

export class GitTreeProvider
	extends AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>
{
	constructor(
		_context: vscode.ExtensionContext,
		_appSettingsService: AppSettingsService,
		private _gitService: GitService,
	) {
		super(_appSettingsService);
		this.getChildrenForContext.set('default', this.getGitRepositories.bind(this));
		this.getChildrenForContext.set(
			'repository',
			(element: vscode.TreeItem | undefined) =>
				this.getRepositoryItems(element as RepositoryItem<any>),
		);
		this.getChildrenForContext.set('repository-branches', (element: vscode.TreeItem | undefined) =>
			this.getRepositoryBranches(element as RepositoryBranchesItem<any>));
		this.getChildrenForContext.set('repository-pull-requests', (element: vscode.TreeItem | undefined) =>
			this.getRepositoryPullRequests(element as RepositoryBranchesItem<any>));
	}

	private async getGitRepositories() {
		const gitRepositories = await this._gitService.getAll();
		return gitRepositories.map(
			(gitRepository) =>
				new RepositoryItem(
					gitRepository,
					undefined,
					this.constructor.name,
					vscode.TreeItemCollapsibleState.Collapsed,
				),
		);
	}

	private async getRepositoryItems(element: RepositoryItem<any>) {
		return [
			new RepositoryBranchesItem(element.item, element, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed),
			new RepositoryPullRequestsItem(element.item, element, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed),
		];
	}

	private async getRepositoryBranches(element: RepositoryBranchesItem<any>) {
		const branches = this._gitService.getBranches(element.getRepositoryId());
		return (await branches).map(
			branch => new RepositoryBranchItem(branch, element, this.constructor.name, vscode.TreeItemCollapsibleState.None)
		);
	}

	private async getRepositoryPullRequests(element: RepositoryPullRequestsItem<any>) {
		const pullRequests = this._gitService.getPullRequests(element.getRepositoryId());
		return (await pullRequests).map(
			pullRequest => new RepositoryPullRequestItem(pullRequest, element, this.constructor.name, vscode.TreeItemCollapsibleState.None)
		);
	}

	public provideDecoration(category: string, uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FileDecoration> {
		return {
			badge: '#',
			color: new vscode.ThemeColor('gitlens.decorations.workspaceRepoOpenForegroundColor'),
			tooltip: '',
		};
	}
}

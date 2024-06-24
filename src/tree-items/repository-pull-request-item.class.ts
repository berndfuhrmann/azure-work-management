import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class RepositoryPullRequestItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<GitPullRequest, ParentItem | undefined> {
	constructor(
		item: GitPullRequest,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'repository-pullrequest');
		this.tooltip = item.description;
	}

	getName() {
		return this.item.title!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'git-pull-request';
	}
	
	getId() {
		return `${this.item.pullRequestId}`;
	}
}

import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class RepositoryPullRequestsItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<GitRepository, ParentItem | undefined> {
	constructor(
		item: GitRepository,
		parent: ParentItem | undefined,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, 'repository-pull-requests');
	}

	getName() {
		return "Pull Requests";
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'git-pull-request';
	}

	getRepositoryId(): string {
		return this.item.id!;
	}
}

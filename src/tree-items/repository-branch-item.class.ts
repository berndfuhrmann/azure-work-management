import { GitBranchStats } from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class RepositoryBranchItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<GitBranchStats, ParentItem | undefined> {
	constructor(
		item: GitBranchStats,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'repository-branch');
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'git-branch';
	}

	getId() {
		return this.item.name!;
	}
}

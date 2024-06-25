import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';
import { mdEscape } from '../utils/mdEscape';

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
		this.tooltip = `Author: ${mdEscape(item.createdBy?.displayName)}\nRequest to merge ${mdEscape(item.sourceRefName)} to ${mdEscape(item.targetRefName)}
		Created: ${mdEscape(item.creationDate?.toLocaleString())}
		${item.description}`;
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

	getResourceUri(): string {
		const uri = super.getResourceUri();
		return `${uri}&status=${this.item.status}&mergeStatus=${this.item.mergeStatus}`;
	}
}

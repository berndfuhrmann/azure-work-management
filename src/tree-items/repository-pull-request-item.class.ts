import { GitPullRequest } from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';
import { refToDisplayString } from '../utils/stringUtils';
import markdownEscape from 'markdown-escape';
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
		this.tooltip = new vscode.MarkdownString()
			.appendText('Author: ')
			.appendMarkdown('`')
			.appendText(item.createdBy!.displayName!)
			.appendMarkdown('`')
			.appendText('\n')
			.appendText('Request to merge ')
			.appendMarkdown('`')
			.appendText(refToDisplayString(this.item.sourceRefName))
			.appendMarkdown('`')
			.appendText(' to ')
			.appendMarkdown('`')
			.appendText(refToDisplayString(item.targetRefName))
			.appendMarkdown('`')
			.appendText('\n')
			.appendText('Created: ')
			.appendMarkdown(
				`== ${markdownEscape(item.creationDate!.toLocaleString())} ==`,
			)
			.appendText('\n')
			.appendText(item.description ?? 'description missing');
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

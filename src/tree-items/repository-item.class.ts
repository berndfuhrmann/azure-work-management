import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';
import { mdEscape } from '../utils/mdEscape';

export class RepositoryItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<GitRepository, ParentItem | undefined> {
	constructor(
		item: GitRepository,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'repository');
		this.tooltip = `Default branch: ${mdEscape(this.item.defaultBranch)}
		Size: ${this.item.size}`;
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'brand-git';
	}

	getRepositoryId(): string {
		return this.item.id!;
	}
	
	getId() {
		return this.item.id!;
	}

	override getItemWebUrl() {
		return this.item.webUrl!;
	}
}

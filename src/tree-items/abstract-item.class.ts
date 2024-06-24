import * as path from 'path';
import * as vscode from 'vscode';
import { extensionName } from '../config';

export abstract class AbstractItem<
	Item,
	ParentItem extends AbstractItem<any, any> | undefined,
> extends vscode.TreeItem {
	constructor(
		public item: Item,
		public parent: ParentItem,
		public viewId: string,
		public contextValue: string,
	) {
		super('');
		this.label = this.getName();
		this.collapsibleState = this.getCollapsibleState();
		const iconName = this.getIconName();
		if (iconName !== undefined) {
			this.iconPath = {
				light: path.join(
					__filename,
					'..',
					'..',
					'resources',
					'light',
					`${iconName}.svg`,
				),
				dark: path.join(
					__filename,
					'..',
					'..',
					'resources',
					'dark',
					`${iconName}.svg`,
				)
			};	
		} else {
			this.iconPath = undefined;
		}
		this.id = this.getId();
		this.resourceUri = vscode.Uri.parse(this.getResourceUri());
	}

	abstract getName(): string;
	abstract getCollapsibleState(): vscode.TreeItemCollapsibleState;
	abstract getIconName(): string;
	abstract getId(): string;

	getResourceUri() {
		return `${extensionName}://${this.viewId}/${this.contextValue}?id=${encodeURIComponent(this.getId())}`;
	}
}

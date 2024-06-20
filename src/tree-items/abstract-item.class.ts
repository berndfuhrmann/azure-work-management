import * as path from 'path';
import * as vscode from 'vscode';

export abstract class AbstractItem<
	Item,
	ParentItem extends AbstractItem<any, any> | undefined,
> extends vscode.TreeItem {
	iconPath = {
		light: '',
		dark: '',
	};

	constructor(
		public item: Item,
		public parent: ParentItem,
		public contextValue: string,
	) {
		super('');
		this.label = this.getName();
		this.collapsibleState = this.getCollapsibleState();
		this.iconPath.light = path.join(
			__filename,
			'..',
			'..',
			'resources',
			'light',
			`${this.getIconName()}.svg`,
		);
		this.iconPath.dark = path.join(
			__filename,
			'..',
			'..',
			'resources',
			'dark',
			`${this.getIconName()}.svg`,
		);
	}

	abstract getName(): string;
	abstract getCollapsibleState(): vscode.TreeItemCollapsibleState;
	abstract getIconName(): string;
}

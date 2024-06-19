import * as vscode from 'vscode';
import { AppSettingsService } from '../services/app-settings.service';
import { AbstractItem } from '../tree-items/abstract-item.class';

export abstract class AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>
{
	protected static defaultKey = 'default';
	protected getChildrenForContext = new Map<
		string,
		(
			element?: vscode.TreeItem | undefined,
		) => vscode.ProviderResult<vscode.TreeItem[]>
	>();

	private _onDidChangeTreeData = new vscode.EventEmitter<undefined>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	constructor(protected _appSettingsService: AppSettingsService) {}

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: vscode.TreeItem) {
		return element;
	}

	getChildren(
		element?: vscode.TreeItem | undefined,
	): vscode.ProviderResult<vscode.TreeItem[]> {
		if (this._appSettingsService.isValidAppSettings()) {
			const getChildren = this.getChildrenForContext.get(
				element?.contextValue ?? AbstractTreeProvider.defaultKey,
			);
			const result = getChildren?.(element) ?? [];
			return result;
		}

		return [];
	}

	getParent(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
		if (element instanceof AbstractItem) {
			return element.parent;
		}
	}
}

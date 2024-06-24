import * as vscode from 'vscode';
import { AppSettingsService } from '../services/app-settings.service';
import { AbstractItem } from '../tree-items/abstract-item.class';
import { extensionName } from '../config';

export abstract class AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>,
	vscode.FileDecorationProvider
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

	async getChildren(
		element?: vscode.TreeItem | undefined,
	): Promise<vscode.TreeItem[]> {
		if (this._appSettingsService.isValidAppSettings()) {
			const getChildren = this.getChildrenForContext.get(
				element?.contextValue ?? AbstractTreeProvider.defaultKey,
			);
			try {
				return await getChildren?.(element) ?? [];
			} catch(error) {
				return [new vscode.TreeItem('Error',vscode.TreeItemCollapsibleState.None)];
			}
		}

		return [];
	}

	getParent(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
		if (element instanceof AbstractItem) {
			return element.parent;
		}
	}

	public provideFileDecoration(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FileDecoration> {
		if (uri.scheme === extensionName) {
			
			if (uri.authority !== this.constructor.name) {
				return undefined;
			}
			return this.provideDecoration(uri.path, uri, token);
		}
	}

	public provideDecoration(category: string, uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FileDecoration> {
		return undefined;
		
		// return {
		// 	badge: '#',
		// 	color: new vscode.ThemeColor('gitlens.decorations.workspaceRepoOpenForegroundColor'),
		// 	tooltip: '',
		// };
	}
}
 
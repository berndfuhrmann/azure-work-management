import * as vscode from 'vscode';
import { AppSettingsService } from '../services/app-settings.service';
import { AbstractItem } from '../tree-items/abstract-item.class';
import { extensionName } from '../config';
import { ErrorItem } from '../tree-items/error-item.class';

export abstract class AbstractTreeProvider
	implements
		vscode.TreeDataProvider<vscode.TreeItem>,
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
				return (await getChildren?.(element)) ?? [];
			} catch (error) {
				return [
					new ErrorItem(
						error,
						element as AbstractItem<any, any>,
						this.constructor.name,
					),
				];
			}
		}

		return [];
	}

	getParent(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
		if (element instanceof AbstractItem) {
			return element.parent;
		}
	}

	public provideFileDecoration(
		uri: vscode.Uri,
		token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.FileDecoration> {
		if (uri.scheme === extensionName && uri.path[0] === '/') {
			if (uri.authority !== this.constructor.name) {
				return undefined;
			}
			const query = {} as Record<string, (string | boolean)[]>;
			for (const pair of uri.query.split('&')) {
				const keyAndValue = pair.split('=', 2);
				const key = keyAndValue[0];
				query[key] ??= [];
				query[key].push(keyAndValue[1] ?? true);
			}
			return this.provideDecoration(uri.path.substring(1), query, uri, token);
		}
	}

	public provideDecoration(
		category: string,
		query: Record<string, (string | boolean)[]>,
		uri: vscode.Uri,
		token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.FileDecoration> {
		return undefined;
	}
}

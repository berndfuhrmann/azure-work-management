import { BehaviorSubject, Observable, of, pairwise, Subscription } from 'rxjs';
import { TreeItem, default as vscode } from 'vscode';
import { extensionName } from '../config';
import { AppSettingsService } from '../services/app-settings.service';
import { AbstractItem } from '../tree-items/abstract-item.class';

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
		) => Observable<vscode.TreeItem[]>
	>();

	private _onDidChangeTreeData = new vscode.EventEmitter<undefined|TreeItem>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
	private _treeView!: vscode.TreeView<vscode.TreeItem>;

	private observables: Map<TreeItem|undefined, {subject: BehaviorSubject<TreeItem[]>, subscriptionSubject: Subscription, subscriptionTreeView: Subscription}> = new Map();

	constructor(protected _appSettingsService: AppSettingsService) {}

	public setTreeView(treeView: vscode.TreeView<vscode.TreeItem>) {
		this._treeView = treeView;
		this._treeViewTitle = treeView.title;
		this._treeView.message = '';
		
		this._treeView.onDidCollapseElement((e) => {
			this._onDidChangeTreeData.fire(e.element);
			this.unsubscribeRecursive(e.element);
		});
	}

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: vscode.TreeItem) {
		return element;
	}

	// private _loadingCounter = 0;
	private _treeViewTitle: string | undefined;
	// private _initialLoaded: boolean = false;

	// private updateLoadingCounter() {
	// 	if (!this._initialLoaded) {
	// 		this._treeView.message = "loading...";
	// 	} else {
	// 		this._treeView.message = undefined;
	// 		if (this._loadingCounter === 0) {
	// 			this._treeView.title = this._treeViewTitle;
	// 		} else {
	// 			this._treeView.title = `${this._treeViewTitle} (Loading...)`;
	// 		}
	// 	}
	// }

	private unsubscribeSingleElement(element?: TreeItem) {
		let entry = this.observables.get(element);

		entry!.subscriptionSubject.unsubscribe();
		entry!.subscriptionTreeView.unsubscribe();
		this.observables.delete(element);
	}

	private unsubscribeRecursive(element?: TreeItem) {
		let entry = this.observables.get(element);
		if (entry !== undefined) {
			for(const child of entry.subject.value) {
				this.unsubscribeRecursive(child);
			}
			this.unsubscribeSingleElement(element);
		}

	}

	async getChildren(
		element?: vscode.TreeItem | undefined,
	): Promise<vscode.TreeItem[]> {

		let entry = this.observables.get(element);

		if (entry === undefined) {
			// this._loadingCounter++;
			// this.updateLoadingCounter();
			const getChildren = this.getChildrenForContext.get(
				element?.contextValue ?? AbstractTreeProvider.defaultKey,
			);
			const newObservable = getChildren?.(element) ?? of<vscode.TreeItem[]>([]);
			const subject = new BehaviorSubject<TreeItem[]>([]);
			const subscriptionSubject = newObservable.subscribe(subject);
			const subscriptionTreeView = subject.pipe(pairwise()).subscribe(([previousValue, newValue]) => {
				this._onDidChangeTreeData.fire(element);
				previousValue.filter(v => !newValue.includes(v)).forEach(v => this.unsubscribeRecursive(v));
			});
			
			this.observables.set(element, entry = {subject, subscriptionSubject, subscriptionTreeView});
		}
		
		return entry.subject.value;

		/*try {
			return await firstValueFrom(entry.subject);
		} catch (error) {
			return [
				new ErrorItem(
					error,
					element as AbstractItem<any, any>,
					this.constructor.name,
				),
			];
		} finally {
			this._loadingCounter--;
			this._initialLoaded = true;
			this.updateLoadingCounter();
		}*/
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

import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';
import { PipelineItem } from './pipeline-item.class';
import { Folder } from 'azure-devops-node-api/interfaces/BuildInterfaces';

interface PipelineFolder {
	folder: Folder,
	children: (PipelineFolderItem<AbstractItem<any, any>> | PipelineItem<AbstractItem<any, any>>)[]
}

export class PipelineFolderItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<PipelineFolder, ParentItem | undefined> {
	constructor(
		item: PipelineFolder,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'pipeline-folder');
	}

	getName() {
		const index = this.item.folder.path!.lastIndexOf("\\");
		return this.item.folder.path!.substring(index === -1 ? 0:(index+1));
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'folder';
	}

	getId() {
		return this.item.folder.path!;
	}
}

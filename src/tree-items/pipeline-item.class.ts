import { Pipeline } from 'azure-devops-node-api/interfaces/PipelinesInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class PipelineItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<Pipeline, ParentItem | undefined> {
	constructor(
		item: Pipeline,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'pipeline');
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'pipeline';
	}


	getId() {
		return ''+this.item.id!;
	}
}

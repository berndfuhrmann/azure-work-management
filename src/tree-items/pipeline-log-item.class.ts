import { Log, Pipeline } from 'azure-devops-node-api/interfaces/PipelinesInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class PipelineLogItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<Log, ParentItem | undefined> {
	constructor(
		item: Log,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'pipeline');
	}

	getName() {
		return ''+this.item.lineCount!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'pipeline-log';
	}


	getId() {
		return ''+this.item.id!;
	}
}

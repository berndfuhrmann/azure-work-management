import { Pipeline, Run } from 'azure-devops-node-api/interfaces/PipelinesInterfaces';
import * as vscode from 'vscode';
import { AbstractItem } from './abstract-item.class';

export class PipelineRunItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<Run, ParentItem | undefined> {
	constructor(
		item: Run,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'pipeline-run');
		
	}

	getName() {
		return this.item.name!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'run';
	}


	getId() {
		return ''+this.item.id!;
	}
}

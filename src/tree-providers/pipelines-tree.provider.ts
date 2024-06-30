import * as vscode from 'vscode';

import { from } from 'rxjs';
import { PipelinesService } from '../api/services/pipelines.service';
import { AppSettingsService } from '../services/app-settings.service';
import { PipelineItem } from '../tree-items/pipeline-item.class';
import { AbstractTreeProvider } from './abstract-tree.provider';
import { PipelineFolderItem } from '../tree-items/pipeline-folder-item.class';
import { AbstractItem } from '../tree-items/abstract-item.class';
import { PipelineRunItem } from '../tree-items/pipeline-run-item.class';
import { PipelineLogItem } from '../tree-items/pipeline-log-item.class';

export class PipelinesTreeProvider
	extends AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>
{
	constructor(
		private _context: vscode.ExtensionContext,
		_appSettingsService: AppSettingsService,
		private _pipelinesService: PipelinesService,
	) {
		super(_appSettingsService);
		
		this.getChildrenForContext.set('default', (_element) => from(this.getRootPipelines()));
		this.getChildrenForContext.set('pipeline-folder', (element) => from(this.getPipelines(element as PipelineFolderItem<AbstractItem<any, any>>)));
		this.getChildrenForContext.set('pipeline', (element) => from(this.getPipelineRun(element as PipelineItem<AbstractItem<any, any>>)));
		this.getChildrenForContext.set('pipeline-run', (element) => from(this.getPipelineLog(element as PipelineRunItem<AbstractItem<any, any>>)));
	}

	private async getPipelineLog(element: PipelineRunItem<AbstractItem<any, any>>) {
		const logs = await this._pipelinesService.getLogs(element.item.pipeline!.id!, element.item.id!);
		
		return logs.logs!.map(log => {
			return new PipelineLogItem(log, element, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed);

		});
	}

	private async getPipelineRun(element: PipelineItem<AbstractItem<any, any>>) {
		const runs = await this._pipelinesService.getRuns(element.item.id!);
		return runs.map(run => {
			return new PipelineRunItem(run, element, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed);

		});
	}

	private async getPipelines(element: PipelineFolderItem<AbstractItem<any, any>>) {
		return element.item.children;
	}

	private async getRootPipelines() {
		const [ pipelines, folders ] = await Promise.all([this._pipelinesService.getPipelines(), this._pipelinesService.getFolders()]);
        const rootPipelines : (PipelineFolderItem<AbstractItem<any, any>>|PipelineItem<AbstractItem<any, any>>)[] = [];
        const pipelineFolders = new Map<string, PipelineFolderItem<AbstractItem<any, any>>>();const f = await this._pipelinesService.getFolders();
		
		let progress;
		do {
			progress = false;
			for (let i = 0; i < folders.length; i++) {
				const folder = folders[i];
				const index = folder.path!.lastIndexOf("\\");
				if (index === 0) {
					const item = new PipelineFolderItem({
						children: [],
						folder
					}, undefined, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed);
					pipelineFolders.set(folder.path!, item);
					rootPipelines.push(item);
					folders.splice(i, 1);
					i--;
					progress = true;
				} else {
					const parentPath = folder.path!.substring(0, index);
					const parentFolderItem = pipelineFolders.get(parentPath);
					if (parentFolderItem) {
						const item = new PipelineFolderItem({
							children: [],
							folder
						}, undefined, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed);
						pipelineFolders.set(folder.path!, item);
						parentFolderItem.item.children.push(item);
						folders.splice(i, 1);
						i--;
						progress = true;
					}

				}
			}
		} while (progress);

		for(const pipeline of pipelines) {
			const parent = pipelineFolders.get(pipeline.folder!);
			if (parent) {
				parent.item.children.push(
					new PipelineItem(pipeline, parent, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed)
				);
			} else {
				rootPipelines.push(
					new PipelineItem(pipeline, undefined, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed)
				);
			}
		}

		return rootPipelines;
	}}

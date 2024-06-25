import { WorkItemService } from "../api/services/work-item.service";
import { WorkItemCommentItem } from "../tree-items/work-item-comment-item.class";
import { WorkItemCommentsItem } from "../tree-items/work-item-comments-item.class";
import { WorkItemItem } from "../tree-items/work-item-item.class";
import * as vscode from 'vscode';

export class WorkItemPartTreeProvider {
    constructor(private _workItemService: WorkItemService) {

    }

    public add(map: Map<string, (element?: vscode.TreeItem | undefined) => vscode.ProviderResult<vscode.TreeItem[]>>) {
        map.set(
			'workItem', 
			(element: vscode.TreeItem | undefined) => 
				this.getWorkItemChildren(element as WorkItemItem<any>),
		);
		map.set(
			'workItemComments', 
			(element: vscode.TreeItem | undefined) => 
				this.getWorkItemComments(element as WorkItemCommentsItem<any>),
		);
    }
        
    private async getWorkItemChildren(element: WorkItemItem<any>) {
        return [
            new WorkItemCommentsItem(element.item, element, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed)
        ];
    }

    private async getWorkItemComments(element: WorkItemCommentsItem<any>) {
        const comments = await this._workItemService.getComments(element.item.id!);
        
        return comments.comments!.map((comment) => {
            return new WorkItemCommentItem(
                comment,
                element,
                this.constructor.name,
                vscode.TreeItemCollapsibleState.None,
            );
        });
    }
}

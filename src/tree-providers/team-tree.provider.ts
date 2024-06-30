import * as vscode from 'vscode';
import { BoardService } from '../api/services/board.service';
import { TeamFieldValue } from '../api/types/team-field-values.type';

import { WorkItemService } from '../api/services/work-item.service';
import { AppSettingsService } from '../services/app-settings.service';
import { BoardItem } from '../tree-items/board-item.class';
import { ColumnItem } from '../tree-items/column-item.class';
import { WorkItemItem } from '../tree-items/work-item-item.class';
import { AbstractTreeProvider } from './abstract-tree.provider';
import { WorkItemPartTreeProvider } from './work-item';
import { from } from 'rxjs';
import { TeamService } from '../api/services/team.service';
import { TeamItem } from '../tree-items/team-item.class';
import { TeamMemberItem } from '../tree-items/team-member-item.class';

export class TeamTreeProvider
	extends AbstractTreeProvider
	implements vscode.TreeDataProvider<vscode.TreeItem>
{
	constructor(
		private _context: vscode.ExtensionContext,
		_appSettingsService: AppSettingsService,
		private _teamService: TeamService,
		private _boardService: BoardService,
		private _workItemService: WorkItemService,
	) {
		super(_appSettingsService);
		const workItemPartTreeProvider = new WorkItemPartTreeProvider(
			_workItemService,
		);
		workItemPartTreeProvider.add(this.getChildrenForContext);

		this.getChildrenForContext.set('default', (_element) => from(this.getTeams()));
		this.getChildrenForContext.set('team', (element) =>
			from(this.getTeamMembers(element as TeamItem<any>)),
		);
		this.getChildrenForContext.set('team-member', (element) => 
			from(this.getWorkItems(element as TeamMemberItem<any>)),
		);
	}

	private async getWorkItems(element: TeamMemberItem<any>) {
		const workItems = await this._workItemService.getWorkItemsAssignedToTeamMember(element.item.identity!.uniqueName!); //FIXME
		return workItems.map(workItem => {
			return new WorkItemItem(workItem, element, this.constructor.name, vscode.TreeItemCollapsibleState.None);
		});
	}

	private async getTeams() {
		const teams = await this._teamService.getTeams();
		return teams.map(team => new TeamItem(team, undefined, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed));
	}

	private async getTeamMembers(element: TeamItem<any>) {
		const teamMembers = await this._teamService.getTeamMembers(element.item.id!);
		return teamMembers.map(teamMember => new TeamMemberItem(teamMember, element, this.constructor.name, vscode.TreeItemCollapsibleState.Collapsed));
	}
}

import * as vscode from 'vscode';
import { setIteration } from './actions/set-current-iteration.action';
import { chooseAction } from './actions/work-item-edit.action';
import { BacklogService } from './api/services/backlog.service';
import { BoardService } from './api/services/board.service';
import { IterationService } from './api/services/iteration.service';
import { TeamFieldValuesService } from './api/services/team-field-values.service';
import { TeamService } from './api/services/team.service';
import { WorkItemService } from './api/services/work-item.service';
import { AppSettingsService } from './services/app-settings.service';
import { WorkItemItem } from './tree-items/work-item-item.class';
import { BacklogTreeProvider } from './tree-providers/backlog-tree.provider';
import { BoardsTreeProvider } from './tree-providers/board-tree.provider';
import { ColumnItem } from './tree-items/column-item.class';

export function activate(context: vscode.ExtensionContext) {
	const appSettingsService = new AppSettingsService();
	const workItemService = new WorkItemService(appSettingsService);
	const backlogService = new BacklogService(
		appSettingsService,
		workItemService,
	);
	const boardService = new BoardService(appSettingsService);
	const iterationService = new IterationService(appSettingsService);
	const teamService = new TeamService(appSettingsService);
	const teamFieldValuesService = new TeamFieldValuesService(appSettingsService);
	const boardTreeProvider: BoardsTreeProvider = new BoardsTreeProvider(
		context,
		appSettingsService,
		boardService,
		workItemService,
	);
	const backlogTreeProvider: BacklogTreeProvider = new BacklogTreeProvider(
		context,
		appSettingsService,
		backlogService,
	);

	vscode.window.registerTreeDataProvider(
		'azure-work-management.open-boards',
		boardTreeProvider,
	);
	vscode.window.registerTreeDataProvider(
		'azure-work-management.open-backlogs',
		backlogTreeProvider,
	);

	vscode.commands.registerCommand('azure-work-management.refresh-boards', () =>
		boardTreeProvider.refresh(),
	);
	vscode.commands.registerCommand(
		'azure-work-management.refresh-backlogs',
		() => backlogTreeProvider.refresh(),
	);

	vscode.commands.registerCommand(
		'azure-work-management.open-config-settings',
		() => {
			vscode.commands.executeCommand(
				'workbench.action.openSettings',
				'azure-work-management',
			);
		},
	);

	vscode.commands.registerCommand(
		'azure-work-management.set-iteration',
		async () =>
			await setIteration(context, {
				appSettingsService,
				iterationService,
				teamFieldValuesService,
			}),
	);

	vscode.commands.registerCommand(
		'azure-work-management.open-work-item',
		(workItem: WorkItemItem<ColumnItem>) => {
			const organizationName: string = encodeURI(
				appSettingsService.getOrganization(),
			);
			const projectName: string = encodeURI(appSettingsService.getProject());
			vscode.env.openExternal(
				vscode.Uri.parse(
					`${appSettingsService.getServerUrl()}${organizationName}/${projectName}/_workitems/edit/${workItem.getWorkItemID()}`,
				),
			);
		},
	);

	vscode.commands.registerCommand(
		'azure-work-management.edit-work-item',
		(workItem: WorkItemItem<ColumnItem>) => {
			chooseAction(workItem, {
				appSettingsService,
				workItemService,
				teamService,
			});
		},
	);
}

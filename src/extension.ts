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
import {
	coreApi,
	gitApi,
	webApi,
	workApi,
	workItemTrackingApi,
} from './services/api.service';
import { combineLatest } from 'rxjs';
import { GitTreeProvider } from './tree-providers/git-tree.provider';
import { GitService } from './api/services/git.service';

export function activate(context: vscode.ExtensionContext) {
	const appSettingsService = new AppSettingsService(context);
	const webApiObservable = webApi(appSettingsService);
	const coreApiObservable = coreApi(webApiObservable);
	const workItemTrackingApiObservable = workItemTrackingApi(webApiObservable);
	const workApiObservable = workApi(webApiObservable);
	const gitApiObservable = gitApi(webApiObservable);

	const workItemService = new WorkItemService(
		appSettingsService.teamContextObservable,
		workItemTrackingApiObservable,
	);
	const backlogService = new BacklogService(
		workItemService,
		appSettingsService.teamContextObservable,
		workApiObservable,
	);
	const boardService = new BoardService(
		appSettingsService.teamContextObservable,
		workApiObservable,
	);
	const iterationService = new IterationService(
		appSettingsService.teamContextObservable,
		workApiObservable,
	);
	const teamService = new TeamService(
		appSettingsService.teamContextObservable,
		coreApiObservable,
	);
	const teamFieldValuesService = new TeamFieldValuesService(appSettingsService);
	const gitService = new GitService(
		appSettingsService.teamContextObservable,
		gitApiObservable,
	);
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
		workItemService,
	);
	const gitTreeProvider: GitTreeProvider = new GitTreeProvider(
		context,
		appSettingsService,
		gitService,
		workItemService,
	);

	combineLatest([
		webApiObservable,
		appSettingsService.teamContextObservable,
	]).subscribe(() => {
		boardTreeProvider.refresh();
		backlogTreeProvider.refresh();
	});
	vscode.window.registerTreeDataProvider(
		'azure-work-management.open-boards',
		boardTreeProvider,
	);
	vscode.window.registerFileDecorationProvider(boardTreeProvider);

	vscode.window.registerTreeDataProvider(
		'azure-work-management.open-backlogs',
		backlogTreeProvider,
	);
	vscode.window.registerFileDecorationProvider(backlogTreeProvider);

	vscode.window.registerTreeDataProvider(
		'azure-work-management.repositories',
		gitTreeProvider,
	);
	vscode.window.registerFileDecorationProvider(gitTreeProvider);

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
		'azure-work-management.open-item',
		(treeViewItem) => {
			let url: string | undefined;
			if (treeViewItem instanceof WorkItemItem) {
				const organizationName: string = encodeURI(
					appSettingsService.getOrganization(),
				);
				const projectName: string = encodeURI(appSettingsService.getProject());
				url = `${appSettingsService.getServerUrl()}${organizationName}/${projectName}/_workitems/edit/${treeViewItem.getWorkItemID()}`;
			} else {
				url = treeViewItem.getItemWebUrl();
			}

			vscode.env.openExternal(vscode.Uri.parse(url!));
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

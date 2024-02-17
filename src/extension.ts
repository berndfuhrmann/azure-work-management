import * as vscode from 'vscode';
import { WorkItemEditActions } from './actions/work-item-edit.actions';
import {
	BacklogService,
	BoardService,
	IterationService,
	ProjectService,
	TeamFieldValuesService,
	TeamService,
	WorkItemService,
} from './api/services';
import { getAppSettings } from './services';
import { WorkItemItem } from './tree-items';
import { BacklogTreeProvider } from './tree-providers/backlog-tree.provider';
import { BoardsTreeProvider } from './tree-providers/board-tree.provider';
import { ApiProvider } from './api/api-provider.class';
import { ApiError } from './api/api-error.class';

export async function activate(context: vscode.ExtensionContext) {
	const apiProvider = new ApiProvider();
	try {
		await apiProvider.initialize();
	} catch (e) {
		if (e instanceof ApiError) {
			vscode.window.showErrorMessage(e.message);
			return;
		}
		throw e;
	}

	const boardService = new BoardService(apiProvider);
	const iterationService = new IterationService(apiProvider);
	const teamService = new TeamService(apiProvider);
	const teamFieldValuesService = new TeamFieldValuesService(apiProvider);
	const workItemService = new WorkItemService(apiProvider);
	const backlogService = new BacklogService(apiProvider, workItemService);

	const boardTreeProvider: BoardsTreeProvider = new BoardsTreeProvider(
		context,
		boardService,
		workItemService,
	);
	const backlogTreeProvider: BacklogTreeProvider = new BacklogTreeProvider(
		context,
		backlogService,
	);

	const workItemEditActions = new WorkItemEditActions(
		teamService,
		workItemService,
	);

	const setCurrentIteration = async () => {
		const iterationsRaw = await iterationService.getIterations();
		const iterations = iterationsRaw.map((iteration) => ({
			label: `${iteration.name}:${iteration.attributes!.timeFrame}`,
			data: iteration,
		}));

		const result = await vscode.window.showQuickPick(iterations, {
			placeHolder: 'Choose An Iteration',
		});

		if (result) {
			getAppSettings().update('iteration', result.data.path, true);
		}

		setTimeout(() => {
			vscode.commands.executeCommand('azure-work-management.refresh-boards');
		}, 1000);
	};

	const setSystemAreaPaths = async (globalState: vscode.Memento) => {
		globalState.update('system-area-path', null);
		const teamFields = await teamFieldValuesService.getTeamFieldValues();
		globalState.update(
			'system-area-path',
			JSON.stringify([...(teamFields.values ?? [])]),
		);
	};

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
		async () => {
			await setSystemAreaPaths(context.globalState);
			setCurrentIteration();
		},
	);

	vscode.commands.registerCommand(
		'azure-work-management.open-work-item',
		(workItem: WorkItemItem) => {
			const organizationName: string = encodeURI(
				getAppSettings().get('organization') as string,
			);
			const projectName: string = encodeURI(
				getAppSettings().get('project') as string,
			);
			vscode.env.openExternal(
				vscode.Uri.parse(
					`${getAppSettings().get('serverUrl')}${organizationName}/${projectName}/_workitems/edit/${workItem.getWorkItemID()}`,
				),
			);
		},
	);

	vscode.commands.registerCommand(
		'azure-work-management.edit-work-item',
		(workItem: WorkItemItem) => {
			workItemEditActions.chooseAction(workItem);
		},
	);
}

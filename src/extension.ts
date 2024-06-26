import * as vscode from 'vscode';
import { chooseAction } from './actions/work-item-edit.actions';
import { IterationService, TeamFieldValuesService } from './api/services';
import { getAppSettings } from './services';
import { WorkItemItem } from './tree-items';
import { BacklogTreeProvider } from './tree-providers/backlog-tree.provider';
import { BoardsTreeProvider } from './tree-providers/board-tree.provider';

export function activate(context: vscode.ExtensionContext) {
	const boardTreeProvider: BoardsTreeProvider = new BoardsTreeProvider(context);
	const backlogTreeProvider: BacklogTreeProvider = new BacklogTreeProvider(
		context,
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
			chooseAction(workItem);
		},
	);
}

const setCurrentIteration = async () => {
	const iterationService: IterationService = new IterationService();
	const iterationsRaw = await iterationService.getIterations();

	const iterationTimeframes = {
		0: 'Past',
		1: 'Current',
		2: 'Future',
		3: 'Unknown',
	};

	const iterations = iterationsRaw.map((iteration) => ({
		label: `${iteration.name}:${iterationTimeframes[iteration.attributes!.timeFrame ?? 3]}`,
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
	const teamFieldValuesService: TeamFieldValuesService =
		new TeamFieldValuesService();
	const teamFields = await teamFieldValuesService.getTeamFieldValues();
	globalState.update(
		'system-area-path',
		JSON.stringify([...(teamFields.values ?? [])]),
	);
};

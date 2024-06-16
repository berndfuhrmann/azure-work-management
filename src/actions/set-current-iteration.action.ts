import * as vscode from 'vscode';
import { IterationService } from '../api/services/iteration.service';
import { AppSettingsService } from '../services/app-settings.service';
import { TeamFieldValuesService } from '../api/services/team-field-values.service';

export const setIteration = async (
	context: vscode.ExtensionContext,
	{
		appSettingsService,
		iterationService,
		teamFieldValuesService,
	}: {
		appSettingsService: AppSettingsService;
		iterationService: IterationService;
		teamFieldValuesService: TeamFieldValuesService;
	},
) => {
	await setSystemAreaPaths(context.globalState, teamFieldValuesService);
	setCurrentIteration({ appSettingsService, iterationService });
};

const setCurrentIteration = async ({
	appSettingsService,
	iterationService,
}: {
	appSettingsService: AppSettingsService;
	iterationService: IterationService;
}) => {
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
		appSettingsService
			.getAppSettings()
			.update('iteration', result.data.path, true);
	}

	setTimeout(() => {
		vscode.commands.executeCommand('azure-work-management.refresh-boards');
	}, 1000);
};

const setSystemAreaPaths = async (
	globalState: vscode.Memento,
	teamFieldValuesService: TeamFieldValuesService,
) => {
	globalState.update('system-area-path', null);
	const teamFields = await teamFieldValuesService.getTeamFieldValues();
	globalState.update(
		'system-area-path',
		JSON.stringify([...(teamFields.values ?? [])]),
	);
};

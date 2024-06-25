import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import * as vscode from 'vscode';

export class AppSettingsService {
	public static readonly configurationSection = 'azure-work-management';

	private readonly _settingsObservable = new BehaviorSubject(
		this.getSettings(),
	);

	private readonly _teamContextObservable = new BehaviorSubject(
		this.getTeamContext(),
	);

	/**
	 * A stream of server settings. Completes when extension is shutting down.
	 */
	public settingsObservable = this._settingsObservable.pipe(
		distinctUntilChanged((prev, curr) => {
			return (
				prev.organization === curr.organization &&
				prev.personalAccessToken === curr.personalAccessToken &&
				prev.serverUrl === curr.serverUrl
			);
		}),
		map(
			(settings) =>
				new Promise<{
					serverUrl: string;
					personalAccessToken: string;
					organization: string;
				}>((resolve, reject) => {
					if (
						settings.organization &&
						settings.personalAccessToken &&
						settings.serverUrl
					) {
						resolve(settings);
					} else {
						reject();
					}
				}),
		),
	);

	/**
	 * A stream of team settings. Completes when extension is shutting down.
	 */
	public teamContextObservable = this._teamContextObservable.pipe(
		distinctUntilChanged((prev, curr) => {
			return prev.project === curr.project && prev.team === curr.team;
		}),
		map(
			(settings) =>
				new Promise<{
					project: string;
					team: string;
				}>((resolve, reject) => {
					if (settings.project && settings.team) {
						resolve(settings);
					} else {
						reject();
					}
				}),
		),
	);

	constructor(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration((e) => {
				if (e.affectsConfiguration(AppSettingsService.configurationSection)) {
					this._settingsObservable.next(this.getSettings());
					this._teamContextObservable.next(this.getTeamContext());
				}
			}),
			vscode.Disposable.from({
				dispose: () => {
					this._settingsObservable.complete();
					this._teamContextObservable.complete();
				},
			}),
		);
	}

	public getSettings() {
		return {
			serverUrl: this.getServerUrl(),
			personalAccessToken: this.getPersonalAccessToken(),
			organization: this.getOrganization(),
		};
	}

	public getAppSettings() {
		return vscode.workspace.getConfiguration(
			AppSettingsService.configurationSection,
		);
	}

	public getServerUrl() {
		return encodeURI(this.getAppSettings().get('serverUrl') as string);
	}

	public getPersonalAccessToken() {
		return encodeURI(
			this.getAppSettings().get('personalAccessToken') as string,
		);
	}

	public getOrganization() {
		return encodeURI(this.getAppSettings().get('organization') as string);
	}

	public getIteration() {
		return this.getAppSettings().get('iteration') as string;
	}

	public getProject() {
		return this.getAppSettings().get('project') as string;
	}

	public getTeam() {
		return this.getAppSettings().get('team') as string;
	}

	public getTeamContext() {
		return {
			project: this.getProject(),
			team: this.getTeam(),
		};
	}

	public isValidAppSettings() {
		if (
			this.getServerUrl() &&
			this.getOrganization() &&
			this.getPersonalAccessToken() &&
			this.getProject() &&
			this.getTeam() &&
			this.getIteration()
		) {
			return true;
		} else {
			return false;
		}
	}
}

import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import { map, Observable, ReplaySubject } from 'rxjs';
import { AppSettingsService } from './app-settings.service';

export const getWebApi = (appSettingsService: AppSettingsService) => {
	return new WebApi(
		`${appSettingsService.getServerUrl()}${appSettingsService.getOrganization()}`,
		getPersonalAccessTokenHandler(appSettingsService.getPersonalAccessToken()!),
	);
};

export const webApi = (appSettingsService: AppSettingsService) =>
	appSettingsService.settingsObservable.pipe(
		map(async (settingsPromise) => {
			const settings = await settingsPromise;
			return new WebApi(
				`${await settings.serverUrl}${settings.organization}`,
				getPersonalAccessTokenHandler(settings.personalAccessToken!),
			);
		}),
	);

export const apiObservable = <T>(
	webApiObservable: Observable<Promise<WebApi>>,
	getApi: (webApi: Promise<WebApi>) => Promise<T>,
) => {
	const subject = new ReplaySubject<Promise<T>>(1);
	webApiObservable.pipe(map((webApi) => getApi(webApi))).subscribe(subject);
	return subject;
};

export const coreApi = (webApiObservable: Observable<Promise<WebApi>>) =>
	apiObservable(webApiObservable, async (webApi) =>
		(await webApi).getCoreApi(),
	);

export const workItemTrackingApi = (
	webApiObservable: Observable<Promise<WebApi>>,
) =>
	apiObservable(webApiObservable, async (webApi) =>
		(await webApi).getWorkItemTrackingApi(),
	);

export const workApi = (webApiObservable: Observable<Promise<WebApi>>) =>
	apiObservable(webApiObservable, async (webApi) =>
		(await webApi).getWorkApi(),
	);

export const gitApi = (webApiObservable: Observable<Promise<WebApi>>) =>
	apiObservable(webApiObservable, async (webApi) => (await webApi).getGitApi());

export const pipelinesApi = (webApiObservable: Observable<Promise<WebApi>>) =>
	apiObservable(webApiObservable, async (webApi) => (await webApi).getPipelinesApi());

export const buildApi = (webApiObservable: Observable<Promise<WebApi>>) =>
	apiObservable(webApiObservable, async (webApi) => (await webApi).getBuildApi());
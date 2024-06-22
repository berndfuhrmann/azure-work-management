import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api';
import {
	BehaviorSubject,
	map,
	Observable,
	ReplaySubject
} from 'rxjs';
import { AppSettingsService } from './app-settings.service';

export const getWebApi = (appSettingsService: AppSettingsService) => {
	return new WebApi(
		`${appSettingsService.getServerUrl()}${appSettingsService.getOrganization()}`,
		getPersonalAccessTokenHandler(appSettingsService.getPersonalAccessToken()!),
	);
};

export const webApiObservable = (appSettingsService: AppSettingsService) =>
	appSettingsService.settingsObservable.pipe(
		map(
			(settings) =>
				new WebApi(
					`${settings.serverUrl}${settings.organization}`,
					getPersonalAccessTokenHandler(settings.personalAccessToken!),
				),
		),
	);

export const apiObservable = <T>(
	webApiObservable: Observable<WebApi>,
	getApi: (webApi: WebApi) => Promise<T>,
) => {
	const subject = new ReplaySubject(1);
	webApiObservable.pipe(
		map((webApi) => getApi(webApi))
	).subscribe(subject);
	return subject;
}


export const workItemTrackingApi = (webApiObservable: Observable<WebApi>) =>
	apiObservable(webApiObservable, (webApi) => webApi.getWorkItemTrackingApi());
export const workApi = (webApiObservable: Observable<WebApi>) =>
	apiObservable(webApiObservable, (webApi) => webApi.getWorkApi());


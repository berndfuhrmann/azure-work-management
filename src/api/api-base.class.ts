import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { getAppSettings } from '../services/app-settings.service';
import { ApiProvider } from './api-provider.class';

export class ApiBase {
	constructor(protected _apiProvider: ApiProvider) {}
}

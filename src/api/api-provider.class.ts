import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { getAppSettings } from '../services/app-settings.service';
import { WorkApi } from 'azure-devops-node-api/WorkApi';
import { CoreApi } from 'azure-devops-node-api/CoreApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { ApiError } from './api-error.class';

export class ApiProvider {
	private _webApi: WebApi | undefined;
	private _coreApi: CoreApi | undefined;
	private _workApi: WorkApi | undefined;
	private _workItemTrackingApi: WorkItemTrackingApi | undefined;

	constructor() {}

	async initialize() {
		this._webApi = new WebApi(
			`${this.baseUrl}${this.organizationName}`,
			this.authHandler,
		);
		try {
			const connectionData = await this._webApi.connect();
			this._coreApi = await this._webApi.getCoreApi();
			this._workApi = await this._webApi.getWorkApi();
			this._workItemTrackingApi = await this._webApi.getWorkItemTrackingApi();
		} catch (e) {
			if (e instanceof Error && Object.hasOwn(e, 'statusCode')) {
				throw new ApiError(e);
			}
			throw new ApiError();
		}
	}

	public get webApi() {
		return this._webApi!;
	}

	public get coreApi() {
		return this._coreApi!;
	}

	public get workApi() {
		return this._workApi!;
	}

	public get workItemTrackingApi() {
		return this._workItemTrackingApi!;
	}

	protected baseUrl: string = getAppSettings().get('serverUrl') as string;

	protected get organizationName(): string {
		return encodeURI(getAppSettings().get('organization') as string);
	}

	protected authHandler = getPersonalAccessTokenHandler(
		getAppSettings().get('personalAccessToken')!,
	);
}

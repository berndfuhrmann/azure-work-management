import { CoreApi } from 'azure-devops-node-api/CoreApi';
import { Observable } from 'rxjs';
import { observableToPromise } from '../../utils/promise';

export class ProjectService {
	private _coreApi!: Promise<CoreApi>;
	constructor(coreApi: Observable<Promise<CoreApi>>) {
		observableToPromise((v) => (this._coreApi = v), coreApi);
	}

	async getProjects() {
		const coreApi = await this._coreApi;
		return coreApi.getProjects();
	}

	async getTeamsForProject(projectID: string) {
		const coreApi = await this._coreApi;
		return coreApi.getTeams(projectID);
	}
}

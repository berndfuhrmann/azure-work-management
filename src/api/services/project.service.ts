import { ApiBase } from '../api-base.class';

export class ProjectService extends ApiBase {
	async getProjects() {
		return this._apiProvider.coreApi.getProjects();
	}

	async getTeamsForProject(projectID: string) {
		return this._apiProvider.coreApi.getTeams(projectID);
	}
}

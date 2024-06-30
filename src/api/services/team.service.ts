import { CoreApi } from 'azure-devops-node-api/CoreApi';
import { Observable } from 'rxjs';
import { observableToPromise } from '../../utils/promise';

export class TeamService {
	private _project!: Promise<string>;
	private _coreApi!: Promise<CoreApi>;
	constructor(
		project: Observable<Promise<string>>,
		coreApi: Observable<Promise<CoreApi>>,
	) {
		observableToPromise((v) => (this._project = v), project);
		observableToPromise((v) => (this._coreApi = v), coreApi);
	}
	async getTeams() {
		const coreApi = await this._coreApi;
		return await coreApi.getTeams(await this._project);
	}

	async getTeamMembers(teamName: string) {
		const [ coreApi, project ] = await Promise.all([this._coreApi, this._project]);
		return await coreApi.getTeamMembersWithExtendedProperties(
			project,
			teamName,
		);
	}
}

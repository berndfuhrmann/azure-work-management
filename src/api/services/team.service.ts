import { CoreApi } from 'azure-devops-node-api/CoreApi';
import { Observable } from 'rxjs';
import { observableToPromise } from '../../utils/promise';

export class TeamService {
	private _teamContext!: Promise<{ project: string; team: string }>;
	private _coreApi!: Promise<CoreApi>;
	constructor(
		teamContext: Observable<Promise<{ project: string; team: string }>>,
		coreApi: Observable<Promise<CoreApi>>,
	) {
		observableToPromise((v) => (this._teamContext = v), teamContext);
		observableToPromise((v) => (this._coreApi = v), coreApi);
	}
	async getTeams() {
		const coreApi = await this._coreApi;
		return await coreApi.getTeams((await this._teamContext).project);
	}

	async getTeamMembers(projectName: string, teamName: string) {
		const coreApi = await this._coreApi;
		return await coreApi.getTeamMembersWithExtendedProperties(
			projectName,
			teamName,
		);
	}
}

import { getProject } from '../../services';
import { ApiBase } from '../api-base.class';

export class TeamService extends ApiBase {
	async getTeams() {
		return await this._apiProvider.coreApi.getTeams(getProject());
	}

	async getTeamMembers(projectName: string, teamName: string) {
		return await this._apiProvider.coreApi.getTeamMembersWithExtendedProperties(
			projectName,
			teamName,
		);
	}
}

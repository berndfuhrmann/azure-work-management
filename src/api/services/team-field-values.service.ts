import { getTeamContext } from '../../services';
import { ApiBase } from '../api-base.class';

export class TeamFieldValuesService extends ApiBase {
	async getTeamFieldValues() {
		return await this._apiProvider.workApi.getTeamFieldValues(getTeamContext());
	}
}

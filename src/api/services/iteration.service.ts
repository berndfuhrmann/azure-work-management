import { getTeamContext } from '../../services';
import { ApiBase } from '../api-base.class';

export class IterationService extends ApiBase {
	async getIterations() {
		return this._apiProvider.workApi.getTeamIterations(getTeamContext());
	}

	async getCurrentIteration() {
		return this._apiProvider.workApi.getTeamIterations(
			getTeamContext(),
			'current',
		);
	}
}

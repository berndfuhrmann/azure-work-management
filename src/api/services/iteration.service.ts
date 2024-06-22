import { WorkApi } from 'azure-devops-node-api/WorkApi';
import { Observable } from 'rxjs';
import { observableToPromise } from '../../utils/promise';

export class IterationService {
	private _teamContext!: Promise<{ project: string; team: string; }>;
	private _workApi!: Promise<WorkApi>;
	constructor(
		teamContext: Observable<Promise<{project: string, team: string}>>,
		workItemTrackingApi : Observable<Promise<WorkApi>>) {
		observableToPromise(v => this._teamContext = v, teamContext);
		observableToPromise(v => this._workApi = v, workItemTrackingApi);
	}
	
	async getIterations() {
		const workApi = await this._workApi;
		return workApi.getTeamIterations(await this._teamContext);
	}

	async getCurrentIteration() {
		const workApi = await this._workApi;
		return workApi.getTeamIterations(
			await this._teamContext,
			'current',
		);
	}
}

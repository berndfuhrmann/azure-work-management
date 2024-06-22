import { WorkApi } from 'azure-devops-node-api/WorkApi';
import { Observable } from 'rxjs';
import { observableToPromise } from '../../utils/promise';

export class BoardService {
	private _teamContext!: Promise<{ project: string; team: string; }>;
	private _workApi!: Promise<WorkApi>;
	constructor(
		teamContext: Observable<Promise<{project: string, team: string}>>,
		workItemTrackingApi : Observable<Promise<WorkApi>>) {
		observableToPromise(v => this._teamContext = v, teamContext);
		observableToPromise(v => this._workApi = v, workItemTrackingApi);
	}
	
	async getAll() {
		const workApi = await this._workApi;
		return await workApi.getBoards(await this._teamContext);
	}

	async getColumns(boardID: string) {
		const workApi = await this._workApi;
		const board = await workApi.getBoard(
			await this._teamContext,
			boardID,
		);
		return board.columns!;
	}
}

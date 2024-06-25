import { WorkApi } from 'azure-devops-node-api/WorkApi';
import { Observable } from 'rxjs';
import { observableToPromise } from '../../utils/promise';
import { WorkItemService } from './work-item.service';

export class BacklogService {
	private _teamContext!: Promise<{ project: string; team: string }>;
	private _workApi!: Promise<WorkApi>;
	constructor(
		private _workItemService: WorkItemService,
		teamContext: Observable<Promise<{ project: string; team: string }>>,
		workItemTrackingApi: Observable<Promise<WorkApi>>,
	) {
		observableToPromise((v) => (this._teamContext = v), teamContext);
		observableToPromise((v) => (this._workApi = v), workItemTrackingApi);
	}

	async getBacklogs() {
		const workApi = await this._workApi;
		const returnValue = await workApi.getBacklogs(await this._teamContext);
		if (returnValue === null) {
			throw new Error('team / project not found');
		}
		return returnValue;
	}

	async getBacklogWorkItems(backlogID: string) {
		const workApi = await this._workApi;
		const workItems = await workApi.getBacklogLevelWorkItems(
			await this._teamContext,
			backlogID,
		);
		const ids = (workItems.workItems ?? [])
			.map((workItemID) => workItemID.target?.id)
			.filter((id): id is number => typeof id === 'number');
		return this._workItemService.getWorkItems(ids);
	}
}

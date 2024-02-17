import { WorkItemService } from '.';
import { getTeamContext } from '../../services';
import { ApiBase } from '../api-base.class';
import { ApiProvider } from '../api-provider.class';

export class BacklogService extends ApiBase {
	constructor(
		apiProvider: ApiProvider,
		private _workItemService: WorkItemService,
	) {
		super(apiProvider);
	}

	async getBacklogs() {
		return this._apiProvider.workApi.getBacklogs(getTeamContext());
	}

	async getBacklogWorkItems(backlogID: string) {
		const workItems = await this._apiProvider.workApi.getBacklogLevelWorkItems(
			getTeamContext(),
			backlogID,
		);
		const ids = (workItems.workItems ?? [])
			.map((workItemID) => workItemID.target?.id)
			.filter((id): id is number => typeof id === 'number');
		return this._workItemService.getWorkItems(ids);
	}
}

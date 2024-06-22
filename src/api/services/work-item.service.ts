import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { JsonPatchDocument } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { chunk } from 'lodash';

import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { firstValueFrom, Observable } from 'rxjs';
import { TeamFieldValue } from '../types/team-field-values.type';
import { observableToPromise } from '../../utils/promise';

export class WorkItemService {
	private _teamContext!: Promise<{ project: string; team: string; }>;
	private _workItemTrackingApi!: Promise<WorkItemTrackingApi>;
	constructor(
		teamContext: Observable<Promise<{project: string, team: string}>>,
		workItemTrackingApi : Observable<Promise<WorkItemTrackingApi>>) {
		observableToPromise(v => this._teamContext = v, teamContext);
		observableToPromise(v => this._workItemTrackingApi = v, workItemTrackingApi);
	}

	async queryForWorkItems(
		iterationPath: string,
		areaPath: TeamFieldValue[],
		boardColumn: string,
		workItemTypes: string[],
	) {
		const systemAreaPath: string = areaPath
			.map(
				(ap): string =>
					`[System.AreaPath] ${ap.includeChildren ? 'UNDER' : '='} '${ap.value}'`,
			)
			.join(' OR ');
		const workItemType: string = workItemTypes
			.map((wit) => `[System.WorkItemType] = '${wit}'`)
			.join(' OR ');

		const data: { query: string } = {
			query: `SELECT [System.State], [System.Title] FROM WorkItems WHERE [System.IterationPath] = '${iterationPath}' AND (${systemAreaPath}) AND (${workItemType}) AND [System.BoardColumn] = '${boardColumn}' ORDER BY [State] Asc`,
		};

		const workItemTrackingApi = await this._workItemTrackingApi;
		const workItems = await workItemTrackingApi.queryByWiql(
			{
				query: data.query,
			},
			await this._teamContext
		);

		const ids =
			workItems.workItems
				?.map((workItem) => workItem.id)
				.filter((id): id is number => typeof id === 'number') ?? [];
		return this.getWorkItems(ids);
	}

	async getWorkItems(ids: number[]) {
		if (ids.length === 0) {
			return [];
		}

		const workItemTrackingApi = await this._workItemTrackingApi;
		const chunks = chunk(ids, 200);

		const result: WorkItem[] = [];

		const workItemsPromises = chunks.map((idChunk) =>
			workItemTrackingApi.getWorkItems(idChunk),
		);

		for (const workItemPromise of workItemsPromises) {
			result.push(...(await workItemPromise));
		}

		return result;
	}

	async updateWorkItem(
		id: number,
		changes: JsonPatchDocument,
	): Promise<WorkItem> {
		const workItemTrackingApi = await this._workItemTrackingApi;
		return await workItemTrackingApi.updateWorkItem({}, changes, id);
	}
}

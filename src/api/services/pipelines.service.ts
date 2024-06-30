import { PipelinesApi } from 'azure-devops-node-api/PipelinesApi';
import { Observable } from 'rxjs';
import { observableToPromise } from '../../utils/promise';
import { BuildApi } from 'azure-devops-node-api/BuildApi';
import { GetLogExpandOptions } from 'azure-devops-node-api/interfaces/PipelinesInterfaces';

export class PipelinesService {
	private _pipelinesApi!: Promise<PipelinesApi>;
	private _buildApi!: Promise<BuildApi>;
	private _project!: Promise<string>;
	constructor(
		projectObservable: Observable<Promise<string>>, 
		pipelinesApi: Observable<Promise<PipelinesApi>>,
		buildApi: Observable<Promise<BuildApi>>
	) {
		observableToPromise((v) => (this._project = v), projectObservable);
		observableToPromise((v) => (this._pipelinesApi = v), pipelinesApi);
		observableToPromise((v) => (this._buildApi = v), buildApi);

	}

	async getPipelines() {
		const [project, pipelines] = await Promise.all([this._project, this._pipelinesApi]);
		return pipelines.listPipelines(project);
	}

	async getBuilds() {
		const [project, build] = await Promise.all([this._project, this._buildApi]);
		return build.getBuilds(project);
	}

	async getDefinitions() {
		const [project, build] = await Promise.all([this._project, this._buildApi]);
		return build.getDefinitions(project);
	}

	async getRuns(pipelineId: number) {
		const [project, pipelines] = await Promise.all([this._project, this._pipelinesApi]);
		return pipelines.listRuns(project, pipelineId);
	}

	async getLogs(pipelineId: number, runId: number) {
		const [project, pipelines] = await Promise.all([this._project, this._pipelinesApi]);
		return pipelines.listLogs(project, pipelineId, runId);
	}

	async getLogContentUrl(pipelineId: number, runId: number, logId: number) {
		const [project, pipelines] = await Promise.all([this._project, this._pipelinesApi]);
		const log = await pipelines.getLog(project, pipelineId, runId, logId, GetLogExpandOptions.SignedContent);
		return log.signedContent!.url!;
	}

	async getFolders() {
		const [project, build] = await Promise.all([this._project, this._buildApi]);
		return await build.getFolders(project);
	}
}

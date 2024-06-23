import { WorkApi } from 'azure-devops-node-api/WorkApi';
import { Observable } from 'rxjs';
import { observableToPromise } from '../../utils/promise';
import { GitApi } from 'azure-devops-node-api/GitApi';

export class GitService {
	private _teamContext!: Promise<{ project: string; team: string; }>;
	private _gitApi!: Promise<GitApi>;
	constructor(
		teamContext: Observable<Promise<{project: string, team: string}>>,
		gitApi : Observable<Promise<GitApi>>) {
		observableToPromise(v => this._teamContext = v, teamContext);
		observableToPromise(v => this._gitApi = v, gitApi);
	}
	
	async getAll() {
		const [ gitApi, teamContext ] = await Promise.all([this._gitApi, this._teamContext]);
		return gitApi.getRepositories(teamContext.project, true, false, true);
	}

	async getBranches(repositoryId: string) {
		const [ gitApi, teamContext ] = await Promise.all([this._gitApi, this._teamContext]);
		return gitApi.getBranches(repositoryId, teamContext.project);
	}

	async getPullRequests(repositoryId: string) {
		const [ gitApi, teamContext ] = await Promise.all([this._gitApi, this._teamContext]);
		return gitApi.getPullRequests(repositoryId, {},  teamContext.project);
	}

}

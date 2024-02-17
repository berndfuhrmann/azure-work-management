import { getTeamContext } from '../../services';
import { ApiBase } from '../api-base.class';

export class BoardService extends ApiBase {
	async getAll() {
		return await this._apiProvider.workApi.getBoards(getTeamContext());
	}

	async getColumns(boardID: string) {
		const board = await this._apiProvider.workApi.getBoard(
			getTeamContext(),
			boardID,
		);
		return board.columns!;
	}
}

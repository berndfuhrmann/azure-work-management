import * as assert from 'assert';

import * as vscode from 'vscode';
import { BacklogItem } from '../../../tree-items/backlog-item.class';
import { WorkItemItem } from '../../../tree-items';

suite('BacklogItem', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('label', () => {
		const subject = new WorkItemItem({
			id: 5
		}, [{
			name: 'somename'
		}], vscode.TreeItemCollapsibleState.Collapsed);
		assert.strictEqual(subject.label, 'somename');
		
	});
});

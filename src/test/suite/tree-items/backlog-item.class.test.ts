import * as assert from 'assert';

import * as vscode from 'vscode';
import { BacklogItem } from '../../../tree-items/backlog-item.class';

suite('BacklogItem', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('label', () => {
		const subject = new BacklogItem({
			name: 'somename'
		}, vscode.TreeItemCollapsibleState.Collapsed);
		assert.strictEqual(subject.label, 'somename');
		
	});
});

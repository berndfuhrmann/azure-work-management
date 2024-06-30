import { TeamMember } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { AbstractItem } from './abstract-item.class';
import { MarkdownString, TreeItemCollapsibleState } from 'vscode';

export class TeamMemberItem<
	ParentItem extends AbstractItem<any, any>,
> extends AbstractItem<TeamMember, ParentItem | undefined> {
	constructor(
		item: TeamMember,
		parent: ParentItem | undefined,
		viewId: string,
		public collapsibleState: TreeItemCollapsibleState,
	) {
		super(item, parent, viewId, 'team-member');
		this.tooltip = new MarkdownString()
		.appendMarkdown(`![image info](${this.item.identity!.imageUrl})`);

		
	}

	getName() {
		return this.item.identity?.displayName!;
	}

	getCollapsibleState() {
		return this.collapsibleState;
	}

	getIconName(): string {
		return 'user';
	}

	getId() {
		return this.item.identity!.id!;
	}
}

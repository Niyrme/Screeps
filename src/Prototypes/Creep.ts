import { type HarvestAction, UpgradeAction } from "../Handlers/Creep/actions/_index.ts";
import PriorityQueue from "../Lib/priority-queue.ts";

declare global {
	interface CreepMemory {
		actionData: Record<any, any>;
	}

	interface Creep {}

	interface CreepConstructor {
		actions: Map<Id<Creep>, CreepActionQueue>;
		getBodyCost(body: Array<BodyPartConstant>): number;
	}
}

export type CreepAction =
	| HarvestAction
	| UpgradeAction


export type CreepActionType =
	| typeof HarvestAction
	| typeof UpgradeAction

export class CreepActionQueue extends PriorityQueue<CreepAction["type"]> {}

Creep.getBodyCost = body => body.reduce((acc, part) => acc + BODYPART_COST[part], 0);

void function () {
	const actions = new Map();
	_.forEach(Game.creeps, creep => actions.set(creep.id, new CreepActionQueue()));
	Creep.actions = actions;
}();

export {};

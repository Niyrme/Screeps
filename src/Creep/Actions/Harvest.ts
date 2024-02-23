import type { ActionCreep } from "./types";

export namespace ActionHarvest {
	interface Step {
		readonly source: Id<Source>;
		readonly amount?: number;
	}

	export function execute(creep: ActionCreep): ScreepsReturnCode {
		const { amount, source: sourceID } = creep.memory._actionSteps[0] as Step;

		if (amount && amount >= creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
			return ERR_FULL;
		}

		const source = Game.getObjectById(sourceID);
		if (source) {
			return creep.harvest(source);
		} else {
			return ERR_NOT_FOUND;
		}
	}
}

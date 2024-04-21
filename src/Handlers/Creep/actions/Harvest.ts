import { type ActionJSON, BaseAction, CreepActionCode } from "./_base.ts";

export interface HarvestActionData {
	source: Id<Source>;
	amount?: number;
}

export class HarvestAction extends BaseAction<"harvest", HarvestActionData> {
	public readonly type = "harvest";

	execute(): CreepActionCode {
		const { creep } = this;
		const { source: sourceId, amount } = creep.memory.actionData;

		const source = Game.getObjectById(sourceId);
		if (!source) { return CreepActionCode.Error; }

		// @ts-expect-error number > `undefined` === false
		if (creep.store.getUsedCapacity(RESOURCE_ENERGY) >= amount) {
			return CreepActionCode.Next;
		}

		creep.travelTo(source);
		creep.harvest(source);

		// @ts-expect-error number > `undefined` === false
		if (creep.store.getUsedCapacity(RESOURCE_ENERGY) >= amount) {
			return CreepActionCode.Next;
		} else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			return CreepActionCode.Next;
		} else {
			return CreepActionCode.Ok;
		}
	}

	toJSON(): ActionJSON<"harvest"> & HarvestActionData {
		const { source, amount } = this.creep.memory.actionData;
		return {
			...super.toJSON(),
			source,
			amount,
		};
	}
}

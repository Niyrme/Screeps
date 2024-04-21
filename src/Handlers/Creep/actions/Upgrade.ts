import { Logging } from "../../../Utils/_index.ts";
import { type ActionJSON, BaseAction, CreepActionCode } from "./_base.ts";

export interface UpgradeActionData {
	controller: Id<StructureController>;
}

export class UpgradeAction extends BaseAction<"upgrade", UpgradeActionData> {
	readonly type = "upgrade";

	execute(): CreepActionCode {
		const { creep } = this;
		const { controller: controllerId } = creep.memory.actionData;

		const controller = Game.getObjectById(controllerId);
		if (!controller) {
			Logging.error(`UpgradeAction(${creep}) controller not found`);
			return CreepActionCode.Error;
		}

		if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			return CreepActionCode.Next;
		}

		creep.travelTo(controller, { range: 3 });
		creep.upgradeController(controller);

		if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			return CreepActionCode.Next;
		} else {
			return CreepActionCode.Ok;
		}
	}

	toJSON(): ActionJSON<"upgrade"> & UpgradeActionData {
		const { controller } = this.creep.memory.actionData;
		return {
			...super.toJSON(),
			controller,
		};
	}
}

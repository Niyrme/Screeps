import { UnhandledError } from "../util/errors.ts";
import Logging from "../util/logging.ts";
import type { Role, Stages } from "./types";

export interface UpgradeCreepMemory extends CreepMemory {
	role: RoleUpgrade["name"];
	stage: number;
	controller?: Id<StructureController>;
}

export interface UpgradeCreep extends Creep {
	memory: UpgradeCreepMemory;
}

export type RoleUpgrade = Role<"upgrade", UpgradeCreep>

export const roleUpgrade = ((): RoleUpgrade => {
	let _stageI = 0;
	const STAGE_GATHER = _stageI++;
	const STAGE_UPGRADE = _stageI++;

	const stages: Stages<UpgradeCreep> = [];
	stages[STAGE_GATHER] = creep => creep.gatherEnergy();
	stages[STAGE_UPGRADE] = creep => {
		let controller: undefined | null | StructureController;
		if (creep.memory.controller) {
			controller = Game.getObjectById(creep.memory.controller);
		} else {
			controller = creep.room.controller;
		}

		if (controller) {
			const err = creep.upgradeController(controller);
			switch (err) {
				case OK:
				case ERR_BUSY:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(controller);
					break;
				default:
					UnhandledError(err, `${creep.formatContext()}.upgradeController`);
					break;
			}
		} else {
			Logging.error(`${creep.formatContext()} roleUpgrade[STAGE_UPGRADE] no controller`);
		}
	};

	return {
		name: "upgrade",
		execute(creep) {
			if (creep.memory.stage === STAGE_GATHER && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_UPGRADE;
			} else if (creep.memory.stage === STAGE_UPGRADE && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_GATHER;
			}

			stages[creep.memory.stage](creep);
		},
	};
})();

export default roleUpgrade;

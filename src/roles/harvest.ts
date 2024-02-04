import { UnhandledError } from "../util/errors.ts";
import Logging from "../util/logging.ts";
import type { Role, Stages } from "./types";

export interface HarvestCreepMemory extends CreepMemory {
	role: RoleHarvest["name"];
	stage: number;
	source?: Id<Source>;
}

export interface HarvestCreep extends Creep {
	memory: HarvestCreepMemory;
}

export type RoleHarvest = Role<"harvest", HarvestCreep>

export const roleHarvest = ((): RoleHarvest => {
	let _stageI = 0;
	const STAGE_HARVEST = _stageI++;
	const STAGE_DEPOSIT = _stageI++;

	const stages: Stages<HarvestCreep> = [];
	stages[STAGE_HARVEST] = creep => {
		let source: null | Source;
		if (creep.memory.source) {
			source = Game.getObjectById(creep.memory.source);
		} else {
			source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
				filter: s => s.pos.findInRange(FIND_MY_CREEPS, 1, {
					filter: c => c.memory.role === "mine",
				}).length === 0,
			});
		}

		if (source) {
			const err = creep.harvest(source);
			switch (err) {
				case OK:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(source);
					break;
				default:
					UnhandledError(err, `${creep.formatContext()}.harvest`);
					break;
			}
		} else {
			Logging.warning(`${creep.formatContext()} could not find source to harvest`);
		}
	};
	stages[STAGE_DEPOSIT] = creep => {
		let storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
			filter: s => (
					s.structureType === STRUCTURE_SPAWN
					|| s.structureType === STRUCTURE_EXTENSION
				)
				&& s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0,
		});

		if (!storage) {
			storage = creep.room.storage || null;
		}

		if (storage) {
			const err = creep.transfer(storage, RESOURCE_ENERGY);
			switch (err) {
				case OK:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(storage);
					break;
				default:
					UnhandledError(err, `${creep.formatContext()}.transfer`);
					break;
			}
		} else if (creep.room.controller?.my) {
			const err = creep.upgradeController(creep.room.controller);
			switch (err) {
				case OK:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(creep.room.controller);
					break;
				default:
					UnhandledError(err, `${creep.formatContext()}.upgradeController`);
					break;
			}
		}
	};

	return {
		name: "harvest",
		execute(creep) {
			if (creep.memory.stage === STAGE_HARVEST && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_DEPOSIT;
			} else if (creep.memory.stage === STAGE_DEPOSIT && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_HARVEST;
			}

			stages[creep.memory.stage](creep);
		},
	};
})();

export default roleHarvest;

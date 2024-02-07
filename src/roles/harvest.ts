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
				case ERR_BUSY:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(source);
					break;
				default:
					UnhandledError(err, `${creep}.harvest`);
					break;
			}
		} else {
			Logging.warning(`${creep} could not find source to harvest`);
		}
	};
	stages[STAGE_DEPOSIT] = creep => {
		const structures = creep.room.find(FIND_MY_STRUCTURES);

		const find = <T extends StructureConstant>(structureType: T) => _.find(structures, structure => structure.structureType === structureType && (structure as ConcreteStructure<T> & { store: Store<RESOURCE_ENERGY, false> }).store.getFreeCapacity(RESOURCE_ENERGY)) as undefined | ConcreteStructure<T>;

		const target = find(STRUCTURE_TOWER)
			|| find(STRUCTURE_SPAWN)
			|| find(STRUCTURE_EXTENSION)
			|| find(STRUCTURE_STORAGE);

		if (target) {
			const err = creep.transfer(target, RESOURCE_ENERGY);
			switch (err) {
				case OK:
				case ERR_BUSY:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(target);
					break;
				default:
					UnhandledError(err, `${creep}.transfer`);
					break;
			}
		} else if (creep.room.controller?.my) {
			const err = creep.upgradeController(creep.room.controller);
			switch (err) {
				case OK:
				case ERR_BUSY:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(creep.room.controller);
					break;
				default:
					UnhandledError(err, `${creep}.upgradeController`);
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
				if (creep.memory.tempRole === "build") {
					delete creep.memory.tempRole;
					creep.memory.stage = 0;
				} else {
					creep.memory.stage = STAGE_HARVEST;
				}
			}

			stages[creep.memory.stage](creep);
		},
	};
})();

export default roleHarvest;

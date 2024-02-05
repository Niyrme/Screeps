import { UnhandledError } from "../util/errors.ts";
import Logging from "../util/logging.ts";
import type { Role, Stages } from "./types";

export interface RepairCreepMemory extends CreepMemory {
	role: RoleRepair["name"];
	stage: number;
}

export interface RepairCreep extends Creep {
	memory: RepairCreepMemory;
}

export type RoleRepair = Role<"repair", RepairCreep>

export const roleRepair = ((): RoleRepair => {
	let _stageI = 0;
	const STAGE_GATHER = _stageI++;
	const STAGE_REPAIR = _stageI++;

	const stages: Stages<RepairCreep> = [];
	stages[STAGE_GATHER] = creep => creep.gatherEnergy();
	stages[STAGE_REPAIR] = creep => {
		let structure: undefined | null | AnyStructure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
			filter(s) {
				switch (s.structureType) {
					case STRUCTURE_TOWER:
					case STRUCTURE_SPAWN:
						return s.hits < s.hitsMax;
					default:
						return false;
				}
			},
		});

		if (!structure) {
			structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				filter: s => s.my && s.hits < s.hitsMax,
			});
		}

		if (!structure) {
			structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: s => s.structureType === STRUCTURE_CONTAINER && s.hits < s.hitsMax,
			});
		}

		if (!structure) {
			const walls: Array<StructureWall> = creep.room.find(FIND_STRUCTURES, {
				filter: s => s.structureType === STRUCTURE_WALL,
			});

			for (let i = 0; i < 1; i += 0.0001) {
				if ((structure = _.find(walls, wall => (wall.hits / wall.hitsMax) < i))) {
					break;
				}
			}
		}

		if (structure) {
			const err = creep.repair(structure);
			switch (err) {
				case OK:
				case ERR_BUSY:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(structure);
					break;
				default:
					UnhandledError(err, `${creep.formatContext()}.repair`);
					break;
			}
		} else {
			// TODO -> harvest
			Logging.warning(`${creep.formatContext()} no structure to repair`);
		}
	};

	return {
		name: "repair",
		execute(creep) {
			if (creep.memory.stage === STAGE_GATHER && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_REPAIR;
			} else if (creep.memory.stage === STAGE_REPAIR && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_GATHER;
			}

			stages[creep.memory.stage](creep);
		},
	};
})();

export default roleRepair;

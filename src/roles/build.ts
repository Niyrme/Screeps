import { UnhandledError } from "../util/errors.ts";
import Logging from "../util/logging.ts";
import type { Role, Stages } from "./types";

export interface BuildCreepMemory extends CreepMemory {
	role: RoleBuild["name"];
	stage: number;
}

export interface BuildCreep extends Creep {
	memory: BuildCreepMemory;
}

export type RoleBuild = Role<"build", BuildCreep>

export const roleBuild = ((): RoleBuild => {
	let _stageI = 0;
	const STAGE_GATHER = _stageI++;
	const STAGE_BUILD = _stageI++;

	const stages: Stages<BuildCreep> = [];
	stages[STAGE_GATHER] = creep => creep.gatherEnergy();
	stages[STAGE_BUILD] = creep => {
		const constructionSite =
			creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
				filter: c => c.structureType === STRUCTURE_SPAWN,
			})
			|| creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
				filter(c) {
					switch (c.structureType) {
						case STRUCTURE_EXTENSION:
						case STRUCTURE_WALL:
						case STRUCTURE_RAMPART:
							return true;
						default:
							return false;
					}
				},
			})
			|| creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);

		if (constructionSite) {
			const err = creep.build(constructionSite);
			switch (err) {
				case OK:
				case ERR_BUSY:
					break;
				case ERR_NOT_IN_RANGE:
					creep.moveTo(constructionSite);
					break;
				default:
					UnhandledError(err, `${creep.formatContext()}.build`);
					break;
			}
		} else {
			// TODO -> repair
			Logging.warning(`${creep.formatContext()} no construction site`);
		}
	};

	return {
		name: "build",
		execute(creep) {
			if (creep.memory.stage === STAGE_GATHER && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_BUILD;
			} else if (creep.memory.stage === STAGE_BUILD && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_GATHER;
			}

			stages[creep.memory.stage](creep);
		},
	};
})();

export default roleBuild;

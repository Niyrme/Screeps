import { UnhandledError } from "../util/errors.ts";
import Logging from "../util/logging.ts";
import roleRepair from "./repair.ts";
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

	function findFunction<T extends BuildableStructureConstant>(creep: Creep) {
		const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

		return function find<C extends T>(type: C): null | ConstructionSite<C> {
			const sites = _.filter(constructionSites, c => c.structureType === type) as Array<ConstructionSite<C>>;

			if (sites.length === 0) {
				return null;
			} else {
				return sites.reduce((cheapest, current) => (current.progressTotal - current.progress) < (cheapest.progressTotal - cheapest.progress) ? current : cheapest);
			}
		};
	}

	const stages: Stages<BuildCreep> = [];
	stages[STAGE_GATHER] = creep => creep.gatherEnergy();
	stages[STAGE_BUILD] = creep => {
		const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
		if (constructionSites.length === 0) {
			Logging.warning(`${creep} no construction site`);
			creep.memory.tempRole = roleRepair.name;
			creep.memory.stage = 0;
		}

		const find = findFunction(creep);
		const constructionSite =
			find(STRUCTURE_SPAWN)
			|| find(STRUCTURE_TOWER)
			|| find(STRUCTURE_EXTENSION)
			|| find(STRUCTURE_WALL)
			|| find(STRUCTURE_RAMPART)
			|| constructionSites.reduce((cheapest, current) => (current.progressTotal - current.progress) < (cheapest.progressTotal - cheapest.progress) ? current : cheapest);

		const err = creep.build(constructionSite);
		switch (err) {
			case OK:
			case ERR_BUSY:
				break;
			case ERR_NOT_IN_RANGE:
				creep.moveTo(constructionSite);
				break;
			default:
				UnhandledError(err, `${creep}.build`);
				break;
		}
	};

	return {
		name: "build",
		execute(creep) {
			if (creep.memory.stage === STAGE_GATHER && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
				creep.memory.stage = STAGE_BUILD;
			} else if (creep.memory.stage === STAGE_BUILD && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
				if (creep.memory.tempRole === "build") {
					delete creep.memory.tempRole;
					creep.memory.stage = 0;
				} else {
					creep.memory.stage = STAGE_GATHER;
				}
			}

			stages[creep.memory.stage](creep);
		},
	};
})();

export default roleBuild;

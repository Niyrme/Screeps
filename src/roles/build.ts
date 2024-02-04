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
	stages[STAGE_GATHER] = creep => {
	};
	stages[STAGE_BUILD] = creep => {
	};

	return {
		name: "build",
		execute(creep) {
			stages[creep.memory.stage](creep);
		},
	};
})();

export default roleBuild;

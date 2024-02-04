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
	const STAGE_ = _stageI++;

	const stages: Stages<RepairCreep> = [];
	stages[STAGE_] = creep => {
	};

	return {
		name: "repair",
		execute(creep) {
		},
	};
})();

export default roleRepair;

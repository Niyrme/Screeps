import { Unreachable } from "../util/errors.ts";
import type { Role, Stages } from "./types";

export interface MineCreepMemory extends CreepMemory {
	role: RoleMine["name"];
	stage: number;
	source: Id<Source>;
}

export interface MineCreep extends Creep {
	memory: MineCreepMemory;
}

export type RoleMine = Role<"mine", MineCreep>

export const roleMine = ((): RoleMine => {
	let _stageI = 0;
	const STAGE_ = _stageI++;

	const stages: Stages<MineCreep> = [];
	stages[STAGE_] = creep => {
	};

	return {
		name: "mine",
		execute(creep) {
			const source = Game.getObjectById(creep.memory.source);
			if (source) {
				if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
					creep.moveTo(source);
				}
			} else {
				Unreachable(`Creep(${creep.name}, ${creep.memory.role}) no source`);
			}
		},
	};
})();

export default roleMine;

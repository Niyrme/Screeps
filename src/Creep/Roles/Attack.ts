import type { ActionCreepMemory } from "Creep";
import { NotImplementedError } from "Utils";
import { registerRole } from "./util.ts";

export namespace RoleAttack {
	export const RoleName = "attack";

	export function spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError("RoleAttack.spawn");
	}

	export function getActions(creep: Creep): ActionCreepMemory["_actionSteps"] {
		throw new NotImplementedError(`RoleAttack.getActions(${creep})`);
	}
}

registerRole(RoleAttack.RoleName);

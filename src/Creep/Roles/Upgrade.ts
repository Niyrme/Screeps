import type { ActionCreepMemory } from "Creep";
import { NotImplementedError } from "Utils";
import { registerRole } from "./util.ts";

export namespace RoleUpgrade {
	export const RoleName = "upgrade";

	export function spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError("RoleUpgrade.spawn");
	}

	export function getActions(creep: Creep): ActionCreepMemory["_actionSteps"] {
		throw new NotImplementedError(`RoleUpgrade.getActions(${creep})`);
	}
}

registerRole(RoleUpgrade.RoleName);

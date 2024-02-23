import type { ActionCreepMemory } from "Creep";
import { NotImplementedError } from "Utils";
import { registerRole } from "./util.ts";

export namespace RoleReserve {
	export const RoleName = "reserve";

	export function spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError("RoleReserve.spawn");
	}

	export function getActions(creep: Creep): ActionCreepMemory["_actionSteps"] {
		throw new NotImplementedError(`RoleReserve.getActions(${creep})`);
	}
}

registerRole(RoleReserve.RoleName);

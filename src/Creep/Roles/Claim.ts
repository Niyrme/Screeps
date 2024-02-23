import type { ActionCreepMemory } from "Creep";
import { NotImplementedError } from "Utils";
import { registerRole } from "./util.ts";

export namespace RoleClaim {
	export const RoleName = "claim";

	export function spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError("RoleClaim.spawn");
	}

	export function getActions(creep: Creep): ActionCreepMemory["_actionSteps"] {
		throw new NotImplementedError(`RoleClaim.getActions(${creep})`);
	}
}

registerRole(RoleClaim.RoleName);

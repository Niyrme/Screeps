import type { ActionCreepMemory } from "Creep";
import { NotImplementedError } from "Utils";
import { registerRole } from "./util.ts";

export namespace RoleBuild {
	export const RoleName = "build";

	export function spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError("RoleBuild.spawn");
	}

	export function getActions(creep: Creep): ActionCreepMemory["_actionSteps"] {
		throw new NotImplementedError(`RoleBuild.getActions(${creep})`);
	}
}

registerRole(RoleBuild.RoleName);

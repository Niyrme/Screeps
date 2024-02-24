import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleHaul.NAME]: typeof RoleHaul;
	}
}

namespace RoleHaul {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleHaul extends BaseRole {
	public static readonly NAME: "haul" = "haul";

	spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	execute(creep: RoleHaul.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleHaul.NAME);

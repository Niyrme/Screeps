import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleHeal.NAME]: typeof RoleHeal;
	}
}

namespace RoleHeal {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleHeal extends BaseRole {
	public static readonly NAME: "heal" = "heal";

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	public static execute(creep: RoleHeal.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleHeal.NAME);

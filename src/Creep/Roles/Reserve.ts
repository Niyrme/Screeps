import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleReserve.NAME]: typeof RoleReserve;
	}
}

namespace RoleReserve {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleReserve extends BaseRole {
	public static readonly NAME: "reserve" = "reserve";

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	public static execute(creep: RoleReserve.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleReserve.NAME);

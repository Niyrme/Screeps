import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleRepair.NAME]: typeof RoleRepair;
	}
}

namespace RoleRepair {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleRepair extends BaseRole {
	public static readonly NAME: "repair" = "repair";

	spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	execute(creep: RoleRepair.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleRepair.NAME);

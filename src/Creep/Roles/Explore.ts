import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleExplore.NAME]: typeof RoleExplore;
	}
}

namespace RoleExplore {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleExplore extends BaseRole {
	public static readonly NAME: "explore" = "explore";

	spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	execute(creep: RoleExplore.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleExplore.NAME);

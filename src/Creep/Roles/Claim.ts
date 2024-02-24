import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleClaim.NAME]: typeof RoleClaim;
	}
}

namespace RoleClaim {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleClaim extends BaseRole {
	public static readonly NAME: "claim" = "claim";

	spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	execute(creep: RoleClaim.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleClaim.NAME);

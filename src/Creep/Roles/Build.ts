import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleBuild.NAME]: typeof RoleBuild;
	}
}

namespace RoleBuild {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleBuild extends BaseRole {
	public static readonly NAME: "build" = "build";

	spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	execute(creep: RoleBuild.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleBuild.NAME);

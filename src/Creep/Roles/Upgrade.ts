import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleUpgrade.NAME]: typeof RoleUpgrade;
	}
}

namespace RoleUpgrade {
	export interface Memory {
		readonly controller: Id<StructureController>;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleUpgrade extends BaseRole {
	public static readonly NAME: "upgrade" = "upgrade";

	spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	execute(creep: RoleUpgrade.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleUpgrade.NAME);

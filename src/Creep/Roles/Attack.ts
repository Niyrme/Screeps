import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleAttack.NAME]: typeof RoleAttack;
	}
}

namespace RoleAttack {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleAttack extends BaseRole {
	public static readonly NAME: "attack" = "attack";

	spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	execute(creep: RoleAttack.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleAttack.NAME);

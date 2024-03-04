import { NotImplementedError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleExtract.NAME]: typeof RoleExtract;
	}
}

export namespace RoleExtract {
	export interface Memory {
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleExtract extends BaseRole {
	public static readonly NAME: "extract" = "extract";

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	public static execute(creep: RoleExtract.Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

registerRole(RoleExtract.NAME);

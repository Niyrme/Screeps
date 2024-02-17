import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Repair {
			export interface Memory extends CreepMemory {
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}

			export interface Role extends Roles.Role<Creep> {
				spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType;
			}
		}
	}
}

export const ROLE_REPAIR = "repair";
registerRole(ROLE_REPAIR);

export const roleRepair: Roles.Repair.Role = {
	spawn(spawn) {
		throw new NotImplementedError("roleRepair.spawn");
	},
	run(this) {
		throw new NotImplementedError("roleRepair.run");
	},
};

import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Explore {
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

export const ROLE_EXPLORE = "explore";
registerRole(ROLE_EXPLORE);

export const roleExplore: Roles.Explore.Role = {
	spawn(spawn) {
		throw new NotImplementedError("roleExplore.spawn");
	},
	run(this) {
		throw new NotImplementedError("roleExplore.run");
	},
};

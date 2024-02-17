import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace MineLink {
			export interface Memory extends CreepMemory {
				readonly source: Id<Source>;
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}

			export interface Role extends Roles.Role<Creep> {
				spawn(spawn: StructureSpawn, source: Id<Source>): StructureSpawn.SpawnCreepReturnType;
			}
		}
	}
}

export const ROLE_MINE_LINK = "mineLink";
registerRole(ROLE_MINE_LINK);

export const roleMineLink: Roles.MineLink.Role = {
	spawn(spawn, source) {
		throw new NotImplementedError("roleMineLink.spawn");
	},
	run(this) {
		throw new NotImplementedError("roleMineLink.run");
	},
};

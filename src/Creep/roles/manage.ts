import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Manage {
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

export const ROLE_MANAGE = "manage";
registerRole(ROLE_MANAGE);

export const roleManage: Roles.Manage.Role = {
	spawn(spawn) {
		throw new NotImplementedError("roleManage.spawn");
	},
	run(this) {
		const flag = Game.flags[this.room.name]!;
		if (!this.pos.isEqualTo(flag)) {
			this.travelTo(flag, {
				range: 0,
			});
		}
		throw new NotImplementedError("roleManage.run");
	},
};

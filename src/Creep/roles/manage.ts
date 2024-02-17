import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Manage {
			export interface Memory extends CreepMemory {
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}
		}
	}
}

registerRole("manage");

export const roleManage: Roles.Role<Roles.Manage.Creep> = {
	spawn(spawn) {
		throw new NotImplementedError("Manage.spawn");
	},
	run(this) {
		const flag = Game.flags[this.room.name]!;
		if (!this.pos.isEqualTo(flag)) {
			this.travelTo(flag, {
				range: 0,
			});
		}
	},
};

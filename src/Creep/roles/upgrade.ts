import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Upgrade {
			export interface Memory extends CreepMemory {
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}
		}
	}
}

registerRole("upgrade");

export const roleUpgrade: Roles.Role<Roles.Upgrade.Creep> = {
	spawn(spawn) {
		throw new NotImplementedError("Upgrade.spawn");
	},
	run(this) {
	},
};

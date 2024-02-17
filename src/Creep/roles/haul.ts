import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Haul {
			export interface Memory extends CreepMemory {
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}
		}
	}
}

registerRole("haul");

export const roleHaul: Roles.Role<Roles.Haul.Creep> = {
	spawn(spawn) {
		throw new NotImplementedError("Haul.spawn");
	},
	run(this) {
	},
};

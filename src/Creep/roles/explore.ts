import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Explore {
			export interface Memory extends CreepMemory {
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}
		}
	}
}

registerRole("explore");

export const roleExplore: Roles.Role<Roles.Explore.Creep> = {
	spawn(spawn) {
		throw new NotImplementedError("Explore.spawn");
	},
	run(this) {
	},
};

import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace MineDrop {
			export interface Memory extends CreepMemory {
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}
		}
	}
}

registerRole("mineDrop");

export const roleMineDrop: Roles.Role<Roles.MineDrop.Creep> = {
	spawn(spawn) {
		throw new NotImplementedError("MineDrop.spawn");
	},
	run(this) {
	},
};

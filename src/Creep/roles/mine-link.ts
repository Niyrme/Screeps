import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace MineLink {
			export interface Memory extends CreepMemory {
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}
		}
	}
}

registerRole("mineLink");

export const roleMineLink: Roles.Role<Roles.MineLink.Creep> = {
	spawn(spawn) {
		throw new NotImplementedError("MineLink.spawn");
	},
	run(this) {
	},
};

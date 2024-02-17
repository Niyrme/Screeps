import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Repair {
			export interface Memory extends CreepMemory {
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}
		}
	}
}

registerRole("repair");

export const roleRepair: Roles.Role<Roles.Repair.Creep> = {
	spawn(spawn) {
		throw new NotImplementedError("Repair.spawn");
	},
	run(this) {
	},
};

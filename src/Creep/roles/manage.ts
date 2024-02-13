declare global {
	export namespace Creep {
		export namespace Roles {
			export namespace ManageCreep {
				export type RoleName = "manage"

				export interface Memory extends CreepMemory {
					readonly role: Creep.Roles.ManageCreep.RoleName;
				}
			}

			export interface ManageCreep extends Creep {
				memory: Creep.Roles.ManageCreep.Memory;
			}
		}
	}
}

export function roleManage(this: Creep.Roles.ManageCreep) {
}

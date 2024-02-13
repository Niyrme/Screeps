declare global {
	export namespace Creep {
		export namespace Roles {
			export namespace ExploreCreep {
				export type RoleName = "explore"

				export interface Memory extends CreepMemory {
					readonly role: Creep.Roles.ExploreCreep.RoleName;
				}
			}

			export interface ExploreCreep extends Creep {
				memory: Creep.Roles.ExploreCreep.Memory;
			}
		}
	}
}

export function roleExplore(this: Creep.Roles.ExploreCreep) {
}

import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Build {
			export interface Memory extends CreepMemory {
				site: null | Id<ConstructionSite>;
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}
		}
	}
}

registerRole("build");

export const roleBuild: Roles.Role<Roles.Build.Creep> = {
	spawn(spawn) {
		throw new NotImplementedError("Build.spawn");
	},
	run(this) {
	},
};

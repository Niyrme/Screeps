import { NotImplementedError, registerRole } from "util";

declare global {
	export namespace Roles {
		export namespace Build {
			export interface Memory extends CreepMemory {
				gather: boolean;
				site: null | Id<ConstructionSite>;
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}

			export interface Role extends Roles.Role<Creep> {
				spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType;
			}
		}
	}
}

export const ROLE_BUILD = "build";
registerRole(ROLE_BUILD);

const BUILD_CONSTRUCTIONSITE_RANGE = 3;

export const roleBuild: Roles.Build.Role = {
	spawn(spawn) {
		throw new NotImplementedError("roleBuild.spawn");
	},
	run(this) {
		if (this.memory.gather && this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			this.memory.gather = false;
		} else if ((!this.memory.gather) && this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			this.memory.gather = true;
		}

		if (this.memory.gather) {
			throw new NotImplementedError(`${this} gather energy`);
		} else {
			let site: null | ConstructionSite = null;
			if (this.memory.site) {
				site = Game.getObjectById(this.memory.site);
				if (!site) {
					this.memory.site = null;
				}
			}

			if (!site) {
				site = this.room.getConstructionSite();
			}

			if (site) {
				this.memory.site = site.id;
				if (!this.pos.inRangeTo(site, BUILD_CONSTRUCTIONSITE_RANGE)) {
					this.travelTo(site, { range: BUILD_CONSTRUCTIONSITE_RANGE });
				}
				return this.build(site);
			} else {
				this.memory.recycleSelf = true;
				return ERR_NOT_FOUND;
			}
		}
	},
};

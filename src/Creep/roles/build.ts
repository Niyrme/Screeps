import { registerRole } from "util";
import { getBodyCost } from "../util.ts";

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
		const memory: Roles.Build.Memory = {
			home: spawn.room.name,
			recycleSelf: false,
			gather: true,
			site: null,
		};

		const baseBody: Array<BodyPartConstant> = [WORK, CARRY, MOVE];
		const size = Math.max(1, Math.floor(
			spawn.room.energyAvailable / getBodyCost(baseBody),
		));

		const body = _.flatten(_.fill(new Array(size), baseBody));

		return spawn.newCreep(
			body,
			{ memory },
			{
				role: ROLE_BUILD,
			},
		);
	},
	run(this) {
		if (this.memory.gather && this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			this.memory.gather = false;
		} else if ((!this.memory.gather) && this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			this.memory.gather = true;
		}

		if (this.memory.gather) {
			const resource = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
				filter: r => r.resourceType === RESOURCE_ENERGY && r.amount >= this.store.getFreeCapacity(RESOURCE_ENERGY),
			});
			if (resource) {
				const err = this.pickup(resource);

				if (err === ERR_NOT_IN_RANGE) {
					this.travelTo(resource);
					this.pickup(resource);
				}

				return err;
			}
		} else {
			let site: null | ConstructionSite = null;
			if (this.memory.site) {
				site = Game.getObjectById(this.memory.site);
				if (!site) {
					this.memory.site = null;
				}
			}

			if (!site) {
				site = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
			}

			if (site) {
				this.memory.site = site.id;
				if (!this.pos.inRangeTo(site, BUILD_CONSTRUCTIONSITE_RANGE)) {
					this.travelTo(site, { range: BUILD_CONSTRUCTIONSITE_RANGE });
				}
				return this.build(site);
			} else {
				this.memory.recycleSelf = true;
			}
		}

		return ERR_NOT_FOUND;
	},
};

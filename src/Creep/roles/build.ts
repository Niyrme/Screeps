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
		const size = Math.clamp(
			Math.floor(spawn.room.energyCapacityAvailable / getBodyCost(baseBody)),
			1,
			5,
		);

		const body = _.flatten(_.fill(new Array(size), baseBody));

		return spawn.newCreep(
			body,
			{ memory },
			{
				role: ROLE_BUILD,
			},
		);
	},
	run(creep) {
		if (creep.memory.gather && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = false;
		} else if ((!creep.memory.gather) && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = true;
		}

		if (creep.memory.gather) {
			return creep.gatherEnergy();
		} else {
			let site: null | ConstructionSite = null;
			if (creep.memory.site) {
				site = Game.getObjectById(creep.memory.site);
				if (!site) {
					creep.memory.site = null;
				}
			}

			if (!site) {
				site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
			}

			if (site) {
				creep.memory.site = site.id;

				const err = creep.build(site);
				if (err === ERR_NOT_IN_RANGE) {
					creep.travelTo(site, { range: BUILD_CONSTRUCTIONSITE_RANGE });
					return creep.build(site);
				}
				return err;
			} else {
				creep.memory.recycleSelf = true;
			}
		}

		return ERR_NOT_FOUND;
	},
};

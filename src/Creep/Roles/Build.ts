import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleBuild.NAME]: typeof RoleBuild;
	}
}

export namespace RoleBuild {
	export interface Memory {
		gather: boolean;
		site: null | Id<ConstructionSite>;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleBuild extends BaseRole {
	public static readonly NAME: "build" = "build";

	public static spawn(spawn: StructureSpawn, constructionSite: null | Id<ConstructionSite> = null): StructureSpawn.SpawnCreepReturnType {
		return spawn.newGenericCreep(
			[WORK, CARRY, MOVE],
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					gather: true,
					site: constructionSite,
				} as RoleBuild.Creep["memory"],
			},
			{
				role: RoleBuild.NAME,
			},
		);
	}

	public static execute(creep: RoleBuild.Creep): ScreepsReturnCode {
		if (creep.memory.gather && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = false;
		} else if ((!creep.memory.gather) && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = true;
		}

		if (creep.memory.gather) {
			return RoleBuild.gather(creep);
		} else {
			let site: null | ConstructionSite = null;
			if (creep.memory.site) {
				if (!(site = Game.getObjectById(creep.memory.site))) {
					creep.memory.site = null;
				}
			}

			if (!site) {
				site = creep.pos.findClosestByPath(creep.room.getConstructionSites());
			}

			if (site) {
				creep.memory.site = site.id;

				const err = creep.build(site);
				if (err === ERR_NOT_IN_RANGE) {
					creep.travelTo(site, { range: 3 });
					return creep.build(site);
				}
				return err;
			} else {
				creep.memory.recycleSelf = true;
			}
		}

		return ERR_NOT_FOUND;
	}
}

registerRole(RoleBuild.NAME);

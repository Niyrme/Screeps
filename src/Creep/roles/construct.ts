import { UnhandledError, UnreachableError } from "../../util/errors.ts";

declare global {
	namespace Roles {
		export namespace Construct {
			export interface memory extends CreepMemory {
				state: "gather" | "construct";
				constructionSite: null | Id<ConstructionSite>;
			}

			export interface creep extends Creep {
				memory: Roles.Construct.memory;
			}
		}

		export interface Construct extends Roles.CreepRole<Roles.Construct.creep> {
			spawn(spawn: StructureSpawn): ScreepsReturnCode;
		}
	}
}

export const roleConstruct: Roles.Construct = {
	spawn(spawn) {
		return spawn.spawnMaxCreep([WORK, CARRY, MOVE], {
			memory: {
				role: "construct",
				homeRoom: spawn.room.name,
				state: "gather",
			} as Roles.Construct.memory,
		});
	},
	run(creep) {
		if (creep.memory.state === "gather" && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "construct";
		} else if (creep.memory.state === "construct" && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "gather";
		}

		if (creep.memory.state === "gather") {
			creep.collectEnergy();
		} else if (creep.memory.state === "construct") {
			let site: null | ConstructionSite = null;
			if (creep.memory.constructionSite) {
				site = Game.getObjectById(creep.memory.constructionSite);
				if (!site) {
					creep.memory.constructionSite = null;
				}
			}

			if (!site) {
				site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
					ignoreCreeps: true,
				});
				if (site) {
					creep.memory.constructionSite = site.id;
				}
			}

			if (site) {
				const err = creep.build(site);
				switch (err) {
					case OK:
					case ERR_BUSY:
						break;
					case ERR_NOT_IN_RANGE:
						creep.moveTo(site);
						break;
					default:
						throw new UnhandledError(err);
				}
			} else {
				// recycle creep when no more construction sites
				const spawn = creep.pos.findClosestByPath(Game.rooms[creep.memory.homeRoom].find(FIND_MY_SPAWNS), {
					ignoreCreeps: true,
				});
				if (spawn) {
					const err = spawn.recycleCreep(creep);
					switch (err) {
						case OK:
							break;
						case ERR_NOT_IN_RANGE:
							creep.moveTo(spawn);
							break;
						default:
							throw new UnhandledError(err);
					}
				}
			}
		} else {
			throw new UnreachableError(`${creep}.memory.state = ${creep.memory.state}`);
		}
	},
};

export default roleConstruct;

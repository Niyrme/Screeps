import { UnhandledError, UnreachableError } from "../../util/errors.ts";

declare global {
	namespace Roles {
		export namespace Haul {
			export interface memory extends CreepMemory {
				state: "gather" | "deposit";
				target: null | Id<Structure & HasStore>;
			}

			export interface creep extends Creep {
				memory: Roles.Haul.memory;
			}
		}

		export interface Haul extends Roles.CreepRole<Roles.Haul.creep> {
			spawn(spawn: StructureSpawn): ScreepsReturnCode;
		}
	}
}

export const roleHaul: Roles.Haul = {
	spawn(spawn) {
		return spawn.spawnMaxCreep([CARRY, MOVE], {
			memory: {
				role: "haul",
				homeRoom: spawn.room.name,
				state: "gather",
			} as Roles.Haul.memory,
		});
	},
	run(creep) {
		if (creep.memory.state === "gather" && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "deposit";
		} else if (creep.memory.state === "deposit" && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "gather";
		}

		if (creep.memory.state === "gather") {
			if (creep.collectEnergy(false) === ERR_NOT_FOUND) {
				creep.memory.state = "deposit";
			}
		} else if (creep.memory.state === "deposit") {
			let structure: null | (Structure & HasStore) = null;
			if (creep.memory.target) {
				structure = Game.getObjectById(creep.memory.target);
				if ((!structure) || structure.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
					creep.memory.target = null;
					structure = null;
				}
			}

			if (!structure) {
				const structures = creep.room.find(FIND_MY_STRUCTURES, {
					filter(s) {
						switch (s.structureType) {
							case STRUCTURE_SPAWN:
							case STRUCTURE_TOWER:
							case STRUCTURE_EXTENSION:
								return s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
							default:
								return false;
						}
					},
				}) as Array<StructureSpawn | StructureTower | StructureExtension>;

				if (structures.length !== 0) {
					structure = creep.pos.findClosestByPath(structures, {
						ignoreCreeps: true,
					})!;
				}
			}

			if ((!structure) && Game.rooms[creep.memory.homeRoom].storage?.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
				structure = Game.rooms[creep.memory.homeRoom].storage!;
			}

			if (structure) {
				creep.memory.target = structure.id;

				const err = creep.transfer(structure, RESOURCE_ENERGY);
				switch (err) {
					case OK:
					case ERR_BUSY:
						break;
					case ERR_NOT_IN_RANGE:
						creep.moveTo(structure);
						break;
					default:
						throw new UnhandledError(err);
				}
			}
		} else {
			throw new UnreachableError(`${creep}.memory.state = ${creep.memory.state}`);
		}
	},
};

export default roleHaul;

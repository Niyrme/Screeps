import { UnhandledError, UnreachableError } from "../../util/errors.ts";
import Logging from "../../util/logging.ts";

declare global {
	namespace Roles {
		export namespace Repair {
			export interface memory extends CreepMemory {
				state: "gather" | "repair";
				structure: null | Id<Structure>;
			}

			export interface creep extends Creep {
				memory: Roles.Repair.memory;
			}
		}

		export interface Repair extends Roles.CreepRole<Roles.Repair.creep> {
			spawn(spawn: StructureSpawn): ScreepsReturnCode;
		}
	}
}

export const roleRepair: Roles.Repair = {
	spawn(spawn) {
		return spawn.spawnMaxCreep([WORK, CARRY, MOVE], {
			memory: {
				role: "repair",
				homeRoom: spawn.room.name,
				state: "gather",
			} as Roles.Repair.memory,
		});
	},
	run(creep) {
		if (creep.memory.state === "gather" && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "repair";
		} else if (creep.memory.state === "repair" && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "gather";
		}

		if (creep.memory.state === "gather") {
			creep.collectEnergy();
		} else if (creep.memory.state === "repair") {
			let structure: null | undefined | Structure = null;
			if (creep.memory.structure) {
				structure = Game.getObjectById(creep.memory.structure);
				if ((!structure) || structure.hits === structure.hitsMax) {
					creep.memory.structure = null;
					structure = null;
				}
			}

			if (!structure) {
				const damaged: Array<AnyOwnedStructure | StructureContainer> = [
					...creep.room.find(FIND_MY_STRUCTURES, {
						filter: s => s.hits < s.hitsMax,
					}),
					...creep.room.find(FIND_STRUCTURES, {
						filter: s => s.structureType === STRUCTURE_CONTAINER && s.hits < s.hitsMax,
					}) as Array<StructureContainer>,
				];

				if (damaged.length !== 0) {
					structure = creep.pos.findClosestByPath(damaged, {
						ignoreCreeps: true,
					});
				}
			}

			if (!structure) {
				const walls = creep.room.find(FIND_STRUCTURES, {
					filter: { structureType: STRUCTURE_WALL },
				}) as Array<StructureWall>;

				for (let i = 0; i < 1; i += 0.0001) {
					if ((structure = _.find(walls, wall => (wall.hits / wall.hitsMax) < i))) {
						break;
					}
				}
			}

			if (structure) {
				const err = creep.repair(structure);
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
			} else {
				Logging.warning(`${creep} has no structure to repair`);
			}
		} else {
			throw new UnreachableError(`${creep}.memory.state = ${creep.memory.state}`);
		}
	},
};

export default roleRepair;

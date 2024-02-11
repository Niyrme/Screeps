import { UnhandledError, UnreachableError } from "../../util/errors.ts";

declare global {
	namespace Roles {
		export namespace Harvest {
			export interface memory extends CreepMemory {
				state: "harvest" | "deposit";
				source: null | Id<Source>;
			}

			export interface creep extends Creep {
				memory: Roles.Harvest.memory;
			}
		}

		export interface Harvest extends Roles.CreepRole<Roles.Harvest.creep> {
			spawn(spawn: StructureSpawn, bootstrap?: boolean): ScreepsReturnCode;
		}
	}
}

export const roleHarvest: Roles.Harvest = {
	spawn(spawn, bootstrap = false) {
		const baseBody: Array<BodyPartConstant> = [WORK, CARRY, MOVE];
		const memory: Roles.Harvest.memory = {
			role: "harvest",
			homeRoom: spawn.room.name,
			state: "harvest",
			source: null,
		};

		if (bootstrap) {
			return spawn.newCreep(baseBody, { memory });
		} else {
			return spawn.spawnMaxCreep(baseBody, { memory });
		}
	},
	run(creep) {
		if (creep.memory.state === "harvest" && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "deposit";
			creep.memory.source = null;
		} else if (creep.memory.state === "deposit" && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "harvest";
		}

		const homeRoom = Game.rooms[creep.memory.homeRoom];

		if (creep.memory.state === "harvest") {
			let source: null | Source = null;
			if (creep.memory.source) {
				source = Game.getObjectById(creep.memory.source)!;
			}

			if (!source) {
				for (const sourceId of Object.keys(homeRoom.memory.resources.energy)) {
					source = Game.getObjectById(sourceId);

					if (!_.find(Game.creeps, creep => creep.memory.role === "mine" && (creep as Roles.Mine.creep).memory.source === source!.id)) {
						creep.memory.source = source!.id;
						break;
					} else {
						source = null;
					}
				}
			}

			if (source) {
				const err = creep.harvest(source);
				switch (err) {
					case OK:
					case ERR_BUSY:
						break;
					case ERR_NOT_IN_RANGE:
						creep.moveTo(source);
						break;
					default:
						throw new UnhandledError(err);
				}
			} else {
				const freeSourceExists = !!_.find(homeRoom.memory.resources.energy, (_obj, sourceId: Id<Source>) => {
					return !_.find(Game.creeps, creep => creep.memory.role === "mine" && (creep as Roles.Mine.creep).memory.source === Game.getObjectById(sourceId)!.id);
				});

				if (!freeSourceExists) {
					const spawn = creep.pos.findClosestByPath(homeRoom.find(FIND_MY_SPAWNS), {
						ignoreCreeps: true,
					});

					if (spawn) {
						const err = spawn.recycleCreep(creep);
						switch (err) {
							case OK:
							case ERR_BUSY:
								break;
							case ERR_NOT_IN_RANGE:
								creep.moveTo(spawn);
								break;
							default:
								throw new UnhandledError(err);
						}
					}
				}
			}
		} else if (creep.memory.state === "deposit") {
			let structure: null | (Structure & HasStore) = null;

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

			if ((!structure) && Game.rooms[creep.memory.homeRoom].storage?.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
				structure = Game.rooms[creep.memory.homeRoom].storage!;
			}

			if (structure) {
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

export default roleHarvest;

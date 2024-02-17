import { registerRole } from "util";
import { getBodyCost } from "../util.ts";

declare global {
	export namespace Roles {
		export namespace Repair {
			export interface Memory extends CreepMemory {
				gather: boolean;
				structure: null | Id<AnyStructure>;
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

export const ROLE_REPAIR = "repair";
registerRole(ROLE_REPAIR);

const REPAIR_STRUCTURE_RANGE = 3;

export const roleRepair: Roles.Repair.Role = {
	spawn(spawn) {
		const memory: Roles.Repair.Memory = {
			home: spawn.room.name,
			recycleSelf: false,
			gather: true,
			structure: null,
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
				role: ROLE_REPAIR,
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
			creep.gatherEnergy();
		} else {
			let structure: null | AnyStructure = null;
			if (creep.memory.structure) {
				structure = Game.getObjectById(creep.memory.structure);
				if (structure && !(structure.hits < structure.hitsMax)) {
					structure = null;
				}
			}

			if (!structure) {
				const damagedStructures = creep.room.find(FIND_STRUCTURES, {
					filter: s => s.structureType !== STRUCTURE_WALL && s.hits < s.hitsMax,
				});

				if (damagedStructures.length !== 0) {
					const ownedNotRampart = damagedStructures.filter(s => {
						if ("my" in s) {
							return s.my && s.structureType !== STRUCTURE_RAMPART;
						} else {
							return false;
						}
					}) as Array<Exclude<AnyOwnedStructure, StructureRampart>>;

					if (ownedNotRampart.length !== 0) {
						structure = creep.pos.findClosestByPath(ownedNotRampart, { ignoreCreeps: true });
					}

					if (!structure) {
						const roadsContainers = damagedStructures.filter(({ structureType: s }) => s === STRUCTURE_CONTAINER || s === STRUCTURE_ROAD) as Array<StructureContainer | StructureRoad>;
						if (roadsContainers.length !== 0) {
							structure = creep.pos.findClosestByPath(roadsContainers, { ignoreCreeps: true });
						}
					}

					if (!structure) {
						structure = creep.pos.findClosestByPath(damagedStructures, { ignoreCreeps: true });
					}
				}
			}

			if (structure) {
				creep.memory.structure = structure.id;

				let err = creep.repair(structure);
				if (err === ERR_NOT_IN_RANGE) {
					creep.travelTo(structure, { range: REPAIR_STRUCTURE_RANGE });
					err = creep.repair(structure);
				}
				return err;
			}
		}

		return ERR_NOT_FOUND;
	},
};

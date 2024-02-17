import { registerRole } from "util";
import { getBodyCost } from "../util.ts";

declare global {
	export namespace Roles {
		export namespace Harvest {
			export interface Memory extends CreepMemory {
				gather: boolean;
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}

			export interface Role extends Roles.Role<Creep> {
				spawn(spawn: StructureSpawn, bootstrap?: boolean): StructureSpawn.SpawnCreepReturnType;
			}
		}
	}
}

export const ROLE_HARVEST = "harvest";
registerRole(ROLE_HARVEST);

export const roleHarvest: Roles.Harvest.Role = {
	spawn(spawn, bootstrap = false) {
		const memory: Roles.Harvest.Memory = {
			home: spawn.room.name,
			recycleSelf: false,
			gather: true,
		};

		const baseBody: Array<BodyPartConstant> = [WORK, CARRY, MOVE];
		const baseBodyCost = getBodyCost(baseBody);

		const size = Math.max(1, Math.floor(
			(bootstrap ? spawn.room.energyAvailable : spawn.room.energyCapacityAvailable) / baseBodyCost,
		));

		const body = _.flatten(_.fill(new Array(size), baseBody));

		return spawn.newCreep(
			body,
			{ memory },
			{
				role: ROLE_HARVEST,
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
			const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
			if (source) {
				let err = creep.harvest(source);
				if (err === ERR_NOT_IN_RANGE) {
					creep.travelTo(source);
					err = creep.harvest(source);
				}
				return err;
			}
		} else {
			const dest = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				filter(s) {
					switch (s.structureType) {
						case STRUCTURE_SPAWN:
						case STRUCTURE_EXTENSION:
						case STRUCTURE_TOWER:
							return s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
						default:
							return false;
					}
				},
			}) as null | StructureSpawn | StructureExtension | StructureTower;
			if (dest) {
				let err = creep.transfer(dest, RESOURCE_ENERGY);
				if (err === ERR_NOT_IN_RANGE) {
					creep.travelTo(dest);
					err = creep.transfer(dest, RESOURCE_ENERGY);
				}
				return err;
			}
		}
		return ERR_NOT_FOUND;
	},
};

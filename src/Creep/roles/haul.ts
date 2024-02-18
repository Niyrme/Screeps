import { registerRole } from "util";
import { getBodyCost } from "../util.ts";

declare global {
	export namespace Roles {
		export namespace Haul {
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

export const ROLE_HAUL = "haul";
registerRole(ROLE_HAUL);

export const roleHaul: Roles.Haul.Role = {
	spawn(spawn, bootstrap = false) {
		const memory: Roles.Haul.Memory = {
			home: spawn.room.name,
			recycleSelf: false,
			gather: true,
		};

		const baseBody: Array<BodyPartConstant> = [CARRY, MOVE];
		const size = Math.clamp(
			Math.floor(
				(bootstrap ? spawn.room.energyAvailable : spawn.room.energyCapacityAvailable)
				/ getBodyCost(baseBody),
			),
			1,
			6,
		);

		const body = _.flatten(_.fill(new Array(size), baseBody));

		return spawn.newCreep(
			body,
			{ memory },
			{
				role: ROLE_HAUL,
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
			return creep.gatherEnergy(false);
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
			});
			if (dest) {
				const err = creep.transfer(dest, RESOURCE_ENERGY);
				if (err === ERR_NOT_IN_RANGE) {
					creep.travelTo(dest);
					return creep.transfer(dest, RESOURCE_ENERGY);
				}
				return err;
			}
		}

		return ERR_NOT_FOUND;
	},
};

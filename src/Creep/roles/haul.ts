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
				spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType;
			}
		}
	}
}

export const ROLE_HAUL = "haul";
registerRole(ROLE_HAUL);

export const roleHaul: Roles.Haul.Role = {
	spawn(spawn) {
		const memory: Roles.Haul.Memory = {
			home: spawn.room.name,
			recycleSelf: false,
			gather: true,
		};

		const baseBody: Array<BodyPartConstant> = [CARRY, MOVE];
		const size = Math.max(1, Math.floor(
			spawn.room.energyAvailable / getBodyCost(baseBody),
		));

		const body = _.flatten(_.fill(new Array(size), baseBody));

		return spawn.newCreep(
			body,
			{ memory },
			{
				role: ROLE_HAUL,
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
			const dest = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
				const err = this.transfer(dest, RESOURCE_ENERGY);

				if (err === ERR_NOT_IN_RANGE) {
					this.travelTo(dest);
					this.transfer(dest, RESOURCE_ENERGY);
				}

				return err;
			}
		}

		return ERR_NOT_FOUND;
	},
};

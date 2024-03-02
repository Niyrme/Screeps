import { Logging } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleManage.NAME]: typeof RoleManage;
	}
}

export namespace RoleManage {
	namespace Memory {
		export interface Fill {
			readonly id: Id<AnyStoreStructure>;
			readonly resource: ResourceConstant;
			gathering: boolean;
		}
	}

	export interface Memory {
		fill: null | Memory.Fill;
		renew: boolean;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleManage extends BaseRole {
	public static readonly NAME: "manage" = "manage";

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		return spawn.newGenericCreep(
			[CARRY, MOVE],
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					fill: null,
				} as RoleManage.Creep["memory"],
			},
			{
				role: this.NAME,
			},
		);
	}

	public static execute(creep: RoleManage.Creep): ScreepsReturnCode {
		const storage = this.getBaseStorage(creep);
		if (!storage) {
			Logging.error(`${creep} has no storage`);
			return ERR_NOT_FOUND;
		}

		if ((creep.ticksToLive || Infinity) < 100 && !creep.memory.renew) {
			creep.memory.renew = true;
		} else if (creep.memory.renew && (creep.ticksToLive || -Infinity) >= CREEP_LIFE_TIME * 0.99) {
			creep.memory.renew;
		}

		const hasHostiles = creep.room.find(FIND_HOSTILE_CREEPS).length !== 0;

		if (creep.memory.renew && hasHostiles) {
			creep.memory.renew = false;
			creep.memory.fill = null;
		}

		if (creep.memory.renew) {
			const err = this.renew(creep);
			if (err !== ERR_NOT_FOUND) {
				creep.memory.renew = false;
				return err;
			}
		}

		if (creep.memory.fill) {
			let { id: structureId, resource, gathering } = creep.memory.fill;
			if ((!gathering) && creep.store.getUsedCapacity(resource) === 0) {
				creep.memory.fill.gathering = gathering = true;
			}

			if (gathering && storage.store.getUsedCapacity(resource) === 0) {
				creep.memory.fill = null;
				// Logging.warning()
				return ERR_NOT_ENOUGH_RESOURCES;
			}

			const structure = Game.getObjectById(structureId);
			if (!structure) {
				creep.memory.fill = null;
				return ERR_NOT_FOUND;
			}

			if (structure.store.getFreeCapacity(resource) === 0) {
				creep.memory.fill = null;
				return ERR_FULL;
			}

			const requiredResource = structure.store.getFreeCapacity(resource) || Infinity;

			if (gathering && creep.store.getUsedCapacity(resource) >= requiredResource) {
				creep.memory.fill.gathering = gathering = false;
			}

			if (gathering) {
				creep.travelTo(storage);
				return creep.withdraw(storage, resource, Math.min(
					requiredResource,
					creep.store.getCapacity(resource),
				));
			} else {
				creep.travelTo(structure);
				const err = creep.transfer(structure, resource);
				if (err === OK) {
					creep.memory.fill = null;
				}
				return err;
			}
		} else {
			const baseFlag = Game.flags[creep.room.name];

			creep.travelTo(baseFlag, { range: 0 });

			if (creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
				return creep.dumpAllResources(storage);
			}

			const structures = creep.room.getTickCache().structures
				.map<null | AnyStructure>(Game.getObjectById)
				.filter((v): v is Exclude<typeof v, null> => !!v)
				.filter((s): s is Extract<typeof s, AnyStoreStructure> => "store" in s);

			if (hasHostiles) {
				const towers = structures
					.filter((s): s is Extract<typeof s, StructureTower> => s.structureType === STRUCTURE_TOWER)
					.filter(s => s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0);

				if (towers.length !== 0) {
					const target = creep.pos.findClosestByPath(towers, { ignoreCreeps: true });
					if (
						target
						&& (storage.store.getUsedCapacity(RESOURCE_ENERGY) >= target.store.getFreeCapacity(RESOURCE_ENERGY))
					) {
						creep.memory.fill = {
							id: target.id,
							gathering: true,
							resource: RESOURCE_ENERGY,
						};
						return OK;
					}
				}
			}

			const [link] = structures.filter((s): s is Extract<typeof s, StructureLink> => {
				return s.structureType === STRUCTURE_LINK
					&& s.pos.isNearTo(baseFlag);
			});

			if (link?.store.getUsedCapacity(RESOURCE_ENERGY)) {
				return creep.withdraw(link, RESOURCE_ENERGY);
			}

			const sinks = structures
				.filter((s): s is Exclude<typeof s, StructureLink | StructureContainer | StructureStorage> => !(
					s.structureType === STRUCTURE_LINK
					|| s.structureType === STRUCTURE_CONTAINER
					|| s.structureType === STRUCTURE_STORAGE
				));

			const priority = sinks
				.filter(s => s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0)
				.filter((s): s is Extract<typeof s, StructureSpawn | StructureExtension> => {
					return (
						s.structureType === STRUCTURE_SPAWN
						|| s.structureType === STRUCTURE_EXTENSION
					) && !!s.store.getFreeCapacity(RESOURCE_ENERGY);
				});

			if (priority.length !== 0) {
				const target = creep.pos.findClosestByPath(priority, { ignoreCreeps: true });
				if (
					target
					&& (storage.store.getUsedCapacity(RESOURCE_ENERGY) >= target.store.getFreeCapacity(RESOURCE_ENERGY))
				) {
					creep.memory.fill = {
						id: target.id,
						gathering: true,
						resource: RESOURCE_ENERGY,
					};
					return OK;
				}
			}

			const towers = sinks
				.filter(s => s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0)
				.filter((s): s is Extract<typeof s, StructureTower> => s.structureType === STRUCTURE_TOWER);

			if (towers.length !== 0) {
				const target = creep.pos.findClosestByPath(towers, { ignoreCreeps: true });
				if (
					target
					&& (storage.store.getUsedCapacity(RESOURCE_ENERGY) >= target.store.getFreeCapacity(RESOURCE_ENERGY))
				) {
					creep.memory.fill = {
						id: target.id,
						gathering: true,
						resource: RESOURCE_ENERGY,
					};
					return OK;
				}
			}

			return OK;
		}
	}
}

registerRole(RoleManage.NAME);

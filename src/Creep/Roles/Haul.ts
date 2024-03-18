import { CodeToString, Logging, UnreachableError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleHaul.NAME]: typeof RoleHaul;
	}
}

export namespace RoleHaul {
	export interface Memory {
		gather: boolean;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleHaul extends BaseRole {
	public static readonly NAME: "haul" = "haul";

	public static spawn(spawn: StructureSpawn, bootstrap: boolean = false): StructureSpawn.SpawnCreepReturnType {
		const baseBody: Array<BodyPartConstant> = [CARRY, MOVE];
		const size = Math.clamp(
			Math.floor(
				(bootstrap ? spawn.room.energyAvailable : spawn.room.energyCapacityAvailable)
				/ Creep.getBodyCost(baseBody),
			),
			1,
			spawn.room.controller!.level + 3,
		);

		return spawn.newCreep(
			_.flatten(_.fill(new Array(size), baseBody)),
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					gather: true,
				} satisfies RoleHaul.Creep["memory"] as RoleHaul.Creep["memory"],
			},
			{ role: RoleHaul.NAME },
		);
	}

	public static execute(creep: RoleHaul.Creep): ScreepsReturnCode {
		if (creep.memory.gather && creep.store.getFreeCapacity() === 0) {
			creep.memory.gather = false;
		} else if ((!creep.memory.gather) && creep.store.getUsedCapacity() === 0) {
			creep.memory.gather = true;
		}

		if (creep.memory.gather) {
			const { dropped, tombstones, ruins, strucutres } = creep.room.getResources();
			const resources = [
				...dropped,
				...tombstones,
				...ruins,
				...strucutres,
			]
				.filter((r): r is Exclude<typeof r, StructureLink | StructureStorage> => {
					if ("structureType" in r) {
						switch (r.structureType) {
							case STRUCTURE_LINK:
							case STRUCTURE_STORAGE:
								return false;
							default:
								return true;
						}
					} else {
						return true;
					}
				});

			if (resources.length === 0) {
				if (creep.store.getUsedCapacity() !== 0) {
					creep.memory.gather = false;
				}
				return ERR_NOT_FOUND;
			}

			const notContainers = resources.filter((r): r is Exclude<typeof r, StructureContainer> => {
				if ("structureType" in r) {
					return r.structureType !== STRUCTURE_CONTAINER;
				} else {
					return true;
				}
			});

			const target = creep.pos.findClosestByPath(
				notContainers.length !== 0 ? notContainers : resources,
				{ ignoreCreeps: true },
			);

			if (target) {
				if ("store" in target) {
					for (const resourceType of Object.keys(target.store) as Array<ResourceConstant>) {
						if (target.store.getUsedCapacity(resourceType) !== 0) {
							resourceType !== RESOURCE_ENERGY && Logging.debug(`STORE: ${target}`);
							resourceType !== RESOURCE_ENERGY && Logging.debug(`resourceType: ${resourceType}`);
							const err = creep.withdraw(target, RESOURCE_ENERGY);
							if (err === ERR_NOT_IN_RANGE) {
								creep.travelTo(target);
								return creep.withdraw(target, RESOURCE_ENERGY);
							} else {
								resourceType !== RESOURCE_ENERGY && Logging.debug(`withdraw: ${CodeToString(err)}`);
							}
							return err;
						}
					}
				} else if ("amount" in target) {
					target.resourceType !== RESOURCE_ENERGY && Logging.debug(`DROPPED: ${target}`);
					const err = creep.pickup(target);
					if (err === ERR_NOT_IN_RANGE) {
						creep.travelTo(target);
						return creep.pickup(target);
					} else {
						target.resourceType !== RESOURCE_ENERGY && Logging.debug(`pickup: ${target}`);
					}
					return err;
				} else {
					throw new UnreachableError(`invalid resource RoleHaul.execute(${creep})`);
				}
			} else if (creep.store.getUsedCapacity() !== 0) {
				creep.memory.gather = false;
			}

			return ERR_NOT_FOUND;
		} else {
			const { baseStorage, structures } = creep.room.getTickCache();

			if (baseStorage) {
				return creep.dumpAllResources(baseStorage);
			} else {
				const sinks = structures
					.filter((s): s is Extract<typeof s, StructureSpawn | StructureExtension | StructureTower> => {
						switch (s.structureType) {
							case STRUCTURE_SPAWN:
							case STRUCTURE_EXTENSION:
							case STRUCTURE_TOWER:
								return s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
							default:
								return false;
						}
					});

				const target = creep.pos.findClosestByPath(sinks, { ignoreCreeps: true });

				if (target) {
					creep.travelTo(target);
					return creep.transfer(target, RESOURCE_ENERGY);
				} else {
					return ERR_NOT_FOUND;
				}
			}
		}
	}
}

registerRole(RoleHaul.NAME);

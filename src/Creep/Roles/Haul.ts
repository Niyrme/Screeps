import { NotImplementedError, UnreachableError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleHaul.NAME]: typeof RoleHaul;
	}
}

namespace RoleHaul {
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
				} as RoleHaul.Creep["memory"],
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
			const energy = creep.room.getResources(RESOURCE_ENERGY);
			if (energy.length !== 0) {
				const enough = energy.filter(r => {
					if ("store" in r) {
						return r.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getFreeCapacity(RESOURCE_ENERGY);
					} else if ("amount" in r) {
						return r.amount >= creep.store.getFreeCapacity(RESOURCE_ENERGY);
					} else {
						throw new UnreachableError(`invalid resource RoleHaul.execute(${creep})`);
					}
				});

				const target = creep.pos.findClosestByPath(
					enough.length !== 0 ? enough : energy,
					{ ignoreCreeps: true },
				);

				if (target) {
					let err: ScreepsReturnCode;
					if ("store" in target) {
						err = creep.withdraw(target, RESOURCE_ENERGY);
						if (err === ERR_NOT_IN_RANGE) {
							creep.travelTo(target);
							return creep.withdraw(target, RESOURCE_ENERGY);
						}
					} else {
						err = creep.pickup(target);
						if (err === ERR_NOT_IN_RANGE) {
							creep.travelTo(target);
							return creep.pickup(target);
						}
					}

					return err;
				}
			}

			const resoucres = creep.room.getResources();
			if (resoucres.length !== 0) {
				const enough = resoucres.filter(r => {
					if ("store" in r) {
						for (const type of Object.keys(r.store) as Array<ResourceConstant>) {
							if ((r.store.getUsedCapacity(type) || -1) >= creep.store.getFreeCapacity(type)) {
								return true;
							}
						}
						return false;
					} else if ("amount" in r) {
						return r.amount >= creep.store.getFreeCapacity();
					} else {
						throw new UnreachableError(`invalid resource RoleHaul.execute(${creep})`);
					}
				});

				const isCheckEnough = enough.length !== 0;
				const target = creep.pos.findClosestByPath(
					isCheckEnough ? enough : resoucres,
					{ ignoreCreeps: true },
				);

				if (target) {
					if ("store" in target) {
						for (const resourceType of Object.keys(target.store) as Array<ResourceConstant>) {
							const stored = target.store.getUsedCapacity(resourceType);
							if (stored && (
								isCheckEnough
									? stored >= creep.store.getFreeCapacity(resourceType)
									: stored !== 0
							)) {
								const err = creep.withdraw(target, resourceType);
								if (err === ERR_NOT_IN_RANGE) {
									creep.travelTo(target);
									return creep.withdraw(target, resourceType);
								}
								return err;
							}
						}
					} else {
						const err = creep.pickup(target);
						if (err === ERR_NOT_IN_RANGE) {
							creep.travelTo(target);
							return creep.pickup(target);
						}
						return err;
					}
				}
			}

			return ERR_NOT_FOUND;
		} else {
			if (creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
				const structures = creep.room.find(FIND_MY_STRUCTURES, {
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
				}) as Array<StructureSpawn | StructureExtension | StructureTower>;

				const spawnsExtensions = structures.filter(s => {
					return s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION;
				}) as Array<StructureSpawn | StructureExtension>;

				const dest = creep.pos.findClosestByPath(
					spawnsExtensions.length !== 0 ? spawnsExtensions : structures,
					{ ignoreCreeps: true },
				);

				if (dest) {
					const err = creep.transfer(dest, RESOURCE_ENERGY);
					if (err === ERR_NOT_IN_RANGE) {
						creep.travelTo(dest);
						return creep.transfer(dest, RESOURCE_ENERGY);
					}
					return err;
				}
			}

			if (creep.room.storage || Game.rooms[creep.memory.home].storage) {
				const storage = (creep.room.storage || Game.rooms[creep.memory.home].storage)!;

				for (const resourceType of Object.keys(creep.store) as Array<ResourceConstant>) {
					if (creep.store.getUsedCapacity(resourceType) !== 0) {
						const err = creep.transfer(storage, resourceType);
						if (err === ERR_NOT_IN_RANGE) {
							creep.travelTo(storage);
							return creep.transfer(storage, resourceType);
						}
						return err;
					}
				}
			} else {
				const flag = Game.flags[creep.room.name] || Game.flags[creep.memory.home];
				if (flag) {
					const [container] = flag.pos.lookFor(LOOK_STRUCTURES)
						.filter(s => s.structureType === STRUCTURE_CONTAINER) as Array<StructureContainer>;

					if (container) {
						for (const resourceType of Object.keys(creep.store) as Array<ResourceConstant>) {
							if (creep.store.getUsedCapacity(resourceType) !== 0) {
								const err = creep.transfer(container, resourceType);
								if (err === ERR_NOT_IN_RANGE) {
									creep.travelTo(container);
									return creep.transfer(container, resourceType);
								}
								return err;
							}
						}
					}
				}
			}

			return ERR_NOT_FOUND;
		}
	}

	protected static findResource(creep: Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.gatherEnergy(${creep})`);
	}
}

registerRole(RoleHaul.NAME);

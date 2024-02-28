import { UnreachableError } from "Utils";
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
			const resources = creep.room.getResources().filter(e => {
				if ("structureType" in e) {
					return e.structureType !== STRUCTURE_STORAGE;
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

			const link = _.find(
				resources,
				e => ("structureType" in e) && e.structureType === STRUCTURE_LINK,
			) as undefined | StructureLink;

			if (link && link.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
				const err = creep.withdraw(link, RESOURCE_ENERGY);
				if (err === ERR_NOT_IN_RANGE) {
					creep.travelTo(link);
					return creep.withdraw(link, RESOURCE_ENERGY);
				}
				return err;
			}

			const target = creep.pos.findClosestByPath(resources, {
				ignoreCreeps: true,
				filter: s => ("structureType" in s) && s.structureType !== STRUCTURE_LINK,
			});

			if (target) {
				if ("store" in target) {
					for (const resourceType of Object.keys(target.store) as Array<ResourceConstant>) {
						if (target.store.getUsedCapacity(resourceType) !== 0) {
							const err = creep.withdraw(target, RESOURCE_ENERGY);
							if (err === ERR_NOT_IN_RANGE) {
								creep.travelTo(target);
								return creep.withdraw(target, RESOURCE_ENERGY);
							}
							return err;
						}
					}
				} else if ("amount" in target) {
					const err = creep.pickup(target);
					if (err === ERR_NOT_IN_RANGE) {
						creep.travelTo(target);
						return creep.pickup(target);
					}
					return err;
				} else {
					throw new UnreachableError(`invalid resource RoleHaul.execute(${creep})`);
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
}

registerRole(RoleHaul.NAME);

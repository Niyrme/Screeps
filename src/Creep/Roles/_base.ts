import { NotImplementedError } from "Utils";

export abstract class BaseRole {
	public static readonly NAME: string;

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	public static execute(creep: Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}

	protected static gather(creep: Creep, resource: ResourceConstant = RESOURCE_ENERGY, fromStorage: boolean = true): ScreepsReturnCode {
		if (fromStorage && creep.room.storage && creep.room.storage.store.getUsedCapacity(resource) !== 0) {
			const err = creep.withdraw(creep.room.storage, resource);
			if (err === ERR_NOT_IN_RANGE) {
				creep.travelTo(creep.room.storage);
				return creep.withdraw(creep.room.storage, resource);
			}
			return err;
		}

		const src = BaseRole.findEnergySource(creep, true, resource)
			|| BaseRole.findEnergySource(creep, false, resource);

		if (!src) {
			return ERR_NOT_FOUND;
		}

		if ((src as Resource<RESOURCE_ENERGY>).amount) {
			const resource = src as Resource<RESOURCE_ENERGY>;
			const err = creep.pickup(resource);
			if (err === ERR_NOT_IN_RANGE) {
				creep.travelTo(resource);
				return creep.pickup(resource);
			}
			return err;
		} else {
			const structure = src as Exclude<typeof src, Resource>;
			const err = creep.withdraw(structure, resource);
			if (err === ERR_NOT_IN_RANGE) {
				creep.travelTo(structure);
				return creep.withdraw(structure, resource);
			}
			return err;
		}
	}

	private static findEnergySource(creep: Creep, checkHasEnough: boolean, resource: ResourceConstant): null | Tombstone | Ruin | AnyStoreStructure | Resource {
		const { room } = creep;
		const freeCap = creep.store.getFreeCapacity(resource);

		const tombstones = room.find(FIND_TOMBSTONES, {
			filter(t) {
				const stored = t.store.getUsedCapacity(resource);
				return checkHasEnough ? stored >= freeCap : stored !== 0;
			},
		});
		if (tombstones.length !== 0) {
			return creep.pos.findClosestByPath(tombstones);
		}

		const ruins = room.find(FIND_RUINS, {
			filter(r) {
				const stored = r.store.getUsedCapacity(resource);
				return checkHasEnough ? stored >= freeCap : stored !== 0;
			},
		});
		if (ruins.length !== 0) {
			return creep.pos.findClosestByPath(ruins);
		}

		const containers: Array<StructureContainer> = room.find(FIND_STRUCTURES, {
			filter(s) {
				if (s.structureType !== STRUCTURE_CONTAINER) { return false; }
				const stored = s.store.getUsedCapacity(resource);
				return checkHasEnough ? stored >= freeCap : stored !== 0;
			},
		});
		if (containers.length !== 0) {
			return creep.pos.findClosestByPath(containers);
		}

		const dropped: Array<Resource<RESOURCE_ENERGY>> = room.find(FIND_DROPPED_RESOURCES, {
			filter({ resourceType, amount }) {
				return resourceType === resource && (
					checkHasEnough ? amount >= freeCap : amount !== 0
				);
			},
		});
		if (dropped.length !== 0) {
			return creep.pos.findClosestByPath(dropped);
		}

		return null;
	}
}

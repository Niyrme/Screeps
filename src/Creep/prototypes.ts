// [timestamp]/[1:role]
export interface CreepName {
	spawnTime: number;
	role: string;
}

export type EncodeMemory = Omit<CreepName, "spawnTime">

declare global {
	interface CreepConstructor {
		encodeMemory<M extends EncodeMemory>(memory: M): string;
	}

	interface CreepMemory {
		readonly home: string;
		recycleSelf: boolean;
	}

	interface Creep {
		decodeName(): Readonly<CreepName>;

		gatherEnergy(fromStorage?: boolean): ScreepsReturnCode;
	}
}

Creep.encodeMemory = function ({ role }) {
	const roleId = parseInt(_.findKey(Memory.roleMap, roleName => roleName === role)).toString(36);

	return `${roleId}`;
};

Creep.prototype.toString = function () {
	return `Creep(${this.name})`;
};

Creep.prototype.decodeName = function () {
	const [timeStamp, encoded] = this.name.split("|");
	const [roleId] = encoded.split("").map(char => parseInt(char, 36));

	return {
		spawnTime: parseInt(timeStamp, 36),
		role: Memory.roleMap[roleId],
	};
};

function findEnergySource(creep: Creep, checkHasEnough: boolean, fromStorage: boolean): null | Tombstone | Ruin | AnyStoreStructure | Resource<RESOURCE_ENERGY> {
	const { room } = creep;
	const freeCap = creep.store.getFreeCapacity(RESOURCE_ENERGY);
	if (fromStorage && room.storage) {
		const stored = room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
		if (
			(checkHasEnough && stored >= freeCap)
			|| ((!checkHasEnough) && stored !== 0)
		) {
			return room.storage;
		}
	}

	const tombstones = room.find(FIND_TOMBSTONES, {
		filter(t) {
			const stored = t.store.getUsedCapacity(RESOURCE_ENERGY);
			return checkHasEnough ? stored >= freeCap : stored !== 0;
		},
	});
	if (tombstones.length !== 0) {
		return creep.pos.findClosestByPath(tombstones);
	}

	const ruins = room.find(FIND_RUINS, {
		filter(r) {
			const stored = r.store.getUsedCapacity(RESOURCE_ENERGY);
			return checkHasEnough ? stored >= freeCap : stored !== 0;
		},
	});
	if (ruins.length !== 0) {
		return creep.pos.findClosestByPath(ruins);
	}

	const containers = room.find(FIND_STRUCTURES, {
		filter(s) {
			if (s.structureType !== STRUCTURE_CONTAINER) { return false; }
			const stored = s.store.getUsedCapacity(RESOURCE_ENERGY);
			return checkHasEnough ? stored >= freeCap : stored !== 0;
		},
	}) as Array<StructureContainer>;
	if (containers.length !== 0) {
		return creep.pos.findClosestByPath(containers);
	}

	const dropped = room.find(FIND_DROPPED_RESOURCES, {
		filter({ resourceType, amount }) {
			return resourceType === RESOURCE_ENERGY && (
				checkHasEnough ? amount >= freeCap : amount !== 0
			);
		},
	}) as Array<Resource<RESOURCE_ENERGY>>;
	if (dropped.length !== 0) {
		return creep.pos.findClosestByPath(dropped);
	}

	return null;
}

Creep.prototype.gatherEnergy = function (fromStorage = true) {
	const src = findEnergySource(this, true, fromStorage)
		|| findEnergySource(this, false, fromStorage);

	if (!src) {return ERR_NOT_FOUND;}

	if ((src as Resource<RESOURCE_ENERGY>).amount) {
		const err = this.pickup(src as Resource<RESOURCE_ENERGY>);
		if (err === ERR_NOT_IN_RANGE) {
			this.travelTo(src as Resource<RESOURCE_ENERGY>);
			return this.pickup(src as Resource<RESOURCE_ENERGY>);
		}
		return err;
	} else {
		const err = this.withdraw(src as Tombstone | Ruin | AnyStoreStructure, RESOURCE_ENERGY);
		if (err === ERR_NOT_IN_RANGE) {
			this.travelTo(src);
			return this.withdraw(src as Tombstone | Ruin | AnyStoreStructure, RESOURCE_ENERGY);
		}
		return err;
	}
};

export {};

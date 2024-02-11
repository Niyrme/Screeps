import { UnhandledError } from "../util/errors.ts";
import Logging from "../util/logging.ts";

Creep.prototype.toString = function () {
	return `Creep(${this.owner.username}, ${this.name}, ${this.room.name})`;
};

Creep.prototype.collectEnergy = function (fromStorage = true) {
	const pickupEnergy = (target: Resource<RESOURCE_ENERGY>): ScreepsReturnCode => {
		this.memory.pickupSource = {
			type: "dropped",
			resource: target.id,
		};
		const err = this.pickup(target);
		switch (err) {
			case OK:
			case ERR_BUSY:
				break;
			case ERR_NOT_IN_RANGE:
				this.moveTo(target, Memory.visuals ? {
					visualizePathStyle: {
						lineStyle: "dotted",
						stroke: "#ff0",
						opacity: 0.2,
					},
				} : undefined);
				break;
			default:
				throw new UnhandledError(err);
		}
		return err;
	};

	const withdrawEnergy = (target: (Structure & HasStore) | Tombstone | Ruin): ScreepsReturnCode => {
		this.memory.pickupSource = {
			type: "structure",
			structure: target.id,
		};
		const err = this.withdraw(target, RESOURCE_ENERGY);
		switch (err) {
			case OK:
			case ERR_BUSY:
				break;
			case ERR_NOT_IN_RANGE:
				this.moveTo(target, Memory.visuals ? {
					visualizePathStyle: {
						lineStyle: "dashed",
						stroke: "#f5a9b8",
						opacity: 0.2,
					},
				} : undefined);
				break;
			case ERR_NOT_ENOUGH_RESOURCES:
				break;
			default:
				throw new UnhandledError(err, `${this}.collectEnergy(${target})`);
		}
		return err;
	};

	if (this.memory.pickupSource) {
		let err: ScreepsReturnCode = ERR_NOT_FOUND;
		switch (this.memory.pickupSource.type) {
			case "dropped":
				const resource = Game.getObjectById(this.memory.pickupSource.resource);
				if (resource && resource.amount !== 0) {
					err = pickupEnergy(resource);
				}
				break;
			case "structure":
				const structure = Game.getObjectById(this.memory.pickupSource.structure);
				if (structure && structure.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
					err = withdrawEnergy(structure);
				}
				break;
			default:
				// @ts-ignore
				throw new UnreachableError(`${this}.memory.pickupSource.type = ${this.memory.pickupSource.type}`);
		}
		switch (err) {
			case OK:
			case ERR_NOT_FOUND:
				delete this.memory.pickupSource;
		}
		return err;
	}

	const tombstones = this.room.find(FIND_TOMBSTONES, {
		filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY) !== 0,
	});
	if (tombstones.length !== 0) {
		return withdrawEnergy(
			this.pos.findClosestByPath(tombstones, {
				ignoreCreeps: true,
			})!,
		);
	}

	const droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
		filter: r => r.resourceType === RESOURCE_ENERGY,
	}) as Array<Resource<RESOURCE_ENERGY>>;
	if (droppedEnergy.length !== 0) {
		const dropped = this.pos.findClosestByPath(droppedEnergy);
		if (dropped && dropped.amount >= this.store.getFreeCapacity(RESOURCE_ENERGY)) {
			return pickupEnergy(dropped);
		}
	}

	const ruins = this.room.find(FIND_RUINS, {
		filter: r => r.store.getUsedCapacity(RESOURCE_ENERGY) !== 0,
	});
	if (ruins.length !== 0) {
		return withdrawEnergy(
			this.pos.findClosestByPath(ruins, {
				ignoreCreeps: true,
			})!,
		);
	}

	const containers = this.room.find(FIND_STRUCTURES, {
		filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) !== 0,
	}) as Array<StructureContainer>;
	if (containers.length !== 0) {
		return withdrawEnergy(
			this.pos.findClosestByPath(containers, {
				ignoreCreeps: true,
			})!,
		);
	}

	if (fromStorage && this.room.storage?.store.getUsedCapacity(RESOURCE_ENERGY)) {
		return withdrawEnergy(this.room.storage);
	}

	Logging.warning(`${this}.collectEnergy(${fromStorage}) no energy found`);
	return ERR_NOT_FOUND;
};

Creep.prototype.recycleSelf = function () {
	const homeRoom = Game.rooms[this.memory.homeRoom];
	const spawn = this.pos.findClosestByPath(homeRoom.find(FIND_MY_SPAWNS), {
		ignoreCreeps: true,
	});
	if (spawn) {
		const container = spawn.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType === STRUCTURE_CONTAINER }).pop() as undefined | StructureContainer;

		if (container && !this.pos.isEqualTo(container)) {
			return this.moveTo(container);
		}

		const err = spawn.recycleCreep(this);
		switch (err) {
			case OK:
				break;
			case ERR_NOT_IN_RANGE:
				this.moveTo(spawn);
				break;
			default:
				throw new UnhandledError(err);
		}
		return err;
	} else {
		return ERR_NOT_FOUND;
	}
};

export {};

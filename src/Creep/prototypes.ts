import { UnhandledError } from "../util/errors.ts";
import Logging from "../util/logging.ts";

Creep.prototype.toString = function () {
	return `Creep(${this.owner.username}, ${this.name}, ${this.room.name})`;
};

Creep.prototype.collectEnergy = function (fromStorage = true) {
	const withdrawEnergy = (target: Structure | Tombstone | Ruin): ScreepsReturnCode => {
		const err = this.withdraw(target, RESOURCE_ENERGY);
		switch (err) {
			case OK:
			case ERR_BUSY:
				break;
			case ERR_NOT_IN_RANGE:
				this.moveTo(target, Memory.visuals ? {
					visualizePathStyle: {
						lineStyle: "dashed",
						stroke: "#f9f",
						opacity: 0.5,
					},
				} : undefined);
				break;
			default:
				throw new UnhandledError(err, `${this}.collectEnergy(${target})`);
		}
		return err;
	};

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

	for (const sourceId of Object.keys(this.room.memory.resources.energy)) {
		const containers = Game.getObjectById(sourceId)!.pos.findInRange(FIND_STRUCTURES, 1, {
			filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) !== 0,
		}) as Array<StructureContainer>;

		if (containers.length !== 0) {
			return withdrawEnergy(
				this.pos.findClosestByPath(containers, {
					ignoreCreeps: true,
				})!,
			);
		}
	}

	if (fromStorage && this.room.storage?.store.getUsedCapacity(RESOURCE_ENERGY)) {
		return withdrawEnergy(this.room.storage);
	}

	const dropped = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
		filter: { resourceType: RESOURCE_ENERGY },
	});
	if (dropped) {
		const err = this.pickup(dropped);
		switch (err) {
			case OK:
			case ERR_BUSY:
				break;
			case ERR_NOT_IN_RANGE:
				this.moveTo(dropped);
				break;
			default:
				throw new UnhandledError(err);
		}
		return err;
	}

	Logging.warning(`${this}.collectEnergy(${fromStorage}) no energy found`);
	return ERR_NOT_FOUND;
};

export {};

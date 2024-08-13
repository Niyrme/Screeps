import { CreepRole } from "../../Prototypes/Creep.ts";
import { findSource } from "../Utils.ts";

const stateMap = new WeakMap<Creep, boolean>(
	_.filter(Game.creeps, creep => creep.memory.role === CreepRole.Upgrader)
		.map(creep => [creep, creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0]),
);

export function runUpgrade(creep: Creep) {
	if (creep.memory.role !== CreepRole.Upgrader) { return; }
	if (!stateMap.has(creep)) { stateMap.set(creep, creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0); }

	let upgrading = stateMap.get(creep)!;

	if (upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
		upgrading = false;
	} else if (!upgrading && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
		upgrading = true;
	}

	if (upgrading) {
		if (!creep.room.controller?.my) { return; }
		if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
			creep.travelTo(creep.room.controller, { range: 3 });
		}
	} else {
		if (!creep.pos.findInRange(FIND_SOURCES, 1)) {
			const source = findSource(creep);
			source && creep.travelTo(source, { range: 1 });
		}
	}
}

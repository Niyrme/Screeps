import { CreepRole } from "../../Prototypes/Creep.ts";
import { findSource } from "../Utils.ts";

const stateMap = new WeakMap<Creep, boolean>(
	_.filter(Game.creeps, creep => creep.memory.role === CreepRole.Harvester)
		.map(creep => [creep, creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0]),
);

type Sink =
	| StructureSpawn
	| StructureExtension

function findSink(creep: Creep) {
	const sinks = creep.room.find(FIND_MY_STRUCTURES, {
		filter(s): s is Sink {
			switch (s.structureType) {
				case STRUCTURE_SPAWN:
				case STRUCTURE_EXTENSION:
					return s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
				default:
					return false;
			}
		},
	});
	return creep.pos.findClosestByPath(sinks);
}

const enum JunkKey {
	Sink = "HarvestStoreDest",
}

export function runHarvest(creep: Creep) {
	if (creep.memory.role !== CreepRole.Harvester) { return; }
	if (!stateMap.has(creep)) { stateMap.set(creep, creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0); }

	let harvesting = stateMap.get(creep)!;

	if (harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
		delete creep.memory.junkData[JunkKey.Sink];
		stateMap.set(creep, harvesting = false);
	} else if (!harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
		stateMap.set(creep, harvesting = true);
	}

	if (harvesting) {
		if (!creep.pos.findInRange(FIND_SOURCES, 1)) {
			const source = findSource(creep);
			source && creep.travelTo(source, { range: 1 });
		}
	} else {
		if (JunkKey.Sink in creep.memory.junkData) {
			const sink = Game.getObjectById(creep.memory.junkData[JunkKey.Sink] as Id<Sink>);
			if (!sink || sink.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
				delete creep.memory.junkData[JunkKey.Sink];
			}
		}

		if (!(JunkKey.Sink in creep.memory.junkData)) {
			const sink = findSink(creep);
			if (!sink) { return; }
			creep.memory.junkData[JunkKey.Sink] = sink.id;
		}

		const sink = Game.getObjectById(creep.memory.junkData[JunkKey.Sink] as Id<Sink>)!;
		if (creep.transfer(sink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
			creep.travelTo(sink, { range: 1 });
		}
	}
}

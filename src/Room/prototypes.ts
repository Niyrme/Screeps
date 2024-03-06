declare global {
	namespace RoomMemory {
		export namespace Resources {
			export interface Energy {}

			export interface Mineral {}
		}

		export interface Resources {
			readonly energy: Record<Id<Source>, Resources.Energy>;
			readonly minerals: Record<Id<Mineral>, Resources.Mineral>;
		}
	}

	interface RoomMemory {
		resources: RoomMemory.Resources;
		RCL: number;
		attackTargets: Array<Id<Creep | PowerCreep>>;
		visuals: boolean;
	}

	interface Room {
		scanResources(): RoomMemory.Resources;

		getTickCache(): RoomTickCache;
		getResources<R extends ResourceConstant = ResourceConstant>(resourceType?: R): RoomTickCache.Resources;
	}
}

namespace RoomTickCache {
	export interface Resources {
		readonly dropped: Array<Resource>;
		readonly tombstones: Array<Tombstone>;
		readonly ruins: Array<Ruin>;
		readonly strucutres: Array<Exclude<AnyStoreStructure, StructureSpawn | StructureExtension | StructureTower>>;
	}
}

interface RoomTickCache extends TickCache {
	readonly constructionSites: Array<ConstructionSite>;

	readonly structures: Array<AnyStructure>;
	readonly damagedStructures: Array<AnyStructure>;

	readonly resources: RoomTickCache.Resources;

	readonly baseStorage: null | StructureStorage | StructureContainer;

	readonly freeSpawns: Array<StructureSpawn>;
}

const tickCache = new Map<Room["name"], RoomTickCache>;

function getCache(room: Room): RoomTickCache {
	if (tickCache.get(room.name)?.lastUpdated !== Game.time) {
		const roomStructures = room.find(FIND_STRUCTURES);

		const resources: RoomTickCache["resources"] = {
			dropped: room.find(FIND_DROPPED_RESOURCES),
			tombstones: room.find(FIND_TOMBSTONES)
				.filter(t => t.store.getUsedCapacity() !== 0),
			ruins: room.find(FIND_RUINS)
				.filter(r => r.store.getUsedCapacity() !== 0),
			strucutres: roomStructures
				.filter((s): s is AnyStoreStructure => "store" in s)
				.filter((s): s is Exclude<typeof s, StructureSpawn | StructureExtension | StructureTower> => {
					switch (s.structureType) {
						case STRUCTURE_SPAWN:
						case STRUCTURE_TOWER:
						case STRUCTURE_EXTENSION:
							return false;
						case STRUCTURE_LINK:
							if (!s.pos.isNearTo(Game.flags[room.name]!.pos)) {
								return false;
							}
							break;
					}
					return s.store.getUsedCapacity() !== 0 && (("my" in s) ? s.my : true);
				}),
		};

		tickCache.set(room.name, {
			lastUpdated: Game.time,
			constructionSites: room.find(FIND_MY_CONSTRUCTION_SITES),
			structures: roomStructures,
			damagedStructures: roomStructures
				.filter(s => s.hits < s.hitsMax && ("my" in s ? s.my : true)),
			resources,
			baseStorage: room.storage
				|| (
					_.find(roomStructures, s => {
						return s.structureType === STRUCTURE_CONTAINER && s.pos.isNearTo(Game.flags[room.name]);
					}) as undefined | StructureContainer
				)
				|| null,
			freeSpawns: roomStructures
				.filter((s): s is Extract<typeof s, StructureSpawn> => s.structureType === STRUCTURE_SPAWN && !s.spawning),
		});
	}

	return tickCache.get(room.name)!;
}

Room.prototype.toString = function () {
	if (this.controller) {
		return `Room(${this.name}, ${this.controller.level}, ${this.controller.owner?.username ?? "<UNOWNED>"})`;
	} else {
		return `Room(${this.name})`;
	}
};

Room.prototype.scanResources = function () {
	if (this.memory.resources) {
		return this.memory.resources;
	} else {
		const resources: RoomMemory.Resources = {
			energy: {},
			minerals: {},
		};

		this.find(FIND_SOURCES).forEach(source => {
			resources.energy[source.id] = {};
		});
		this.find(FIND_MINERALS).forEach(mineral => {
			resources.minerals[mineral.id] = {};
		});

		return resources;
	}
};

Room.prototype.getTickCache = function () {
	return getCache(this);
};

Room.prototype.getResources = function <R extends ResourceConstant = ResourceConstant>(resourceType: undefined | R = undefined) {
	const { resources } = this.getTickCache();

	if (resourceType) {
		const { dropped, tombstones, ruins, strucutres } = resources;
		return {
			dropped: dropped.filter(r => r.resourceType === resourceType),
			tombstones: tombstones.filter(t => t.store.getUsedCapacity(resourceType) !== 0),
			ruins: ruins.filter(r => r.store.getUsedCapacity(resourceType) !== 0),
			strucutres: strucutres.filter(s => s.store.getUsedCapacity(resourceType) !== 0),
		};
	} else {
		return resources;
	}
};

export {};

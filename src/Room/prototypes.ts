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

		getConstructionSites(): Array<ConstructionSite>;
		getDamagedStructures(): Array<AnyStructure>;
	}
}

namespace RoomTickCache {
	export namespace Resources {
		export interface Dropped {
			readonly id: Id<Resource>;
			readonly resourceType: Resource["resourceType"];
			readonly amount: Resource["amount"];
		}

		export interface StoreObject {
			readonly resources: Partial<Record<ResourceConstant, {
				readonly amount: number
			}>>;
		}

		export interface Tombstones extends StoreObject {
			readonly id: Id<Tombstone>;
		}

		export interface Ruins extends StoreObject {
			readonly id: Id<Ruin>;
		}

		export interface Structures extends StoreObject {
			readonly id: Id<Exclude<AnyStoreStructure, StructureSpawn | StructureExtension | StructureTower>>;
		}
	}

	export interface Resources {
		readonly dropped: Array<Resources.Dropped>;
		readonly tombstones: Array<Resources.Tombstones>;
		readonly ruins: Array<Resources.Ruins>;
		readonly strucutres: Array<Resources.Structures>;
	}
}

interface RoomTickCache extends TickCache {
	readonly constructionSites: Array<Id<ConstructionSite>>;

	readonly structures: Array<Id<AnyStructure>>;
	readonly damagedStructures: Array<Id<AnyStructure>>;

	readonly resources: RoomTickCache.Resources;

	readonly baseStorage: null | Id<StructureStorage | StructureContainer>;

	readonly freeSpawns: Array<Id<StructureSpawn>>;
}

const tickCache = new Map<Room["name"], RoomTickCache>;

function getCache(room: Room): RoomTickCache {
	if (tickCache.get(room.name)?.lastUpdated !== Game.time) {
		const roomStructures = room.find(FIND_STRUCTURES);

		const resources: RoomTickCache["resources"] = {
			dropped: room.find(FIND_DROPPED_RESOURCES)
				.map(({ id, resourceType, amount }) => ({ id, resourceType, amount })),
			tombstones: room.find(FIND_TOMBSTONES)
				.filter(t => t.store.getUsedCapacity() !== 0)
				.map(getCache.mapStoreObject),
			ruins: room.find(FIND_RUINS)
				.filter(r => r.store.getUsedCapacity() !== 0)
				.map(getCache.mapStoreObject),
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
				})
				.map(getCache.mapStoreObject),
		};

		tickCache.set(room.name, {
			lastUpdated: Game.time,
			constructionSites: room.find(FIND_MY_CONSTRUCTION_SITES).map(global.getId),
			structures: roomStructures.map(global.getId),
			damagedStructures: roomStructures
				.filter(s => s.hits < s.hitsMax && ("my" in s ? s.my : true))
				.map(global.getId),
			resources,
			baseStorage: room.storage?.id
				|| (
					_.find(roomStructures, s => {
						return s.structureType === STRUCTURE_CONTAINER && s.pos.isNearTo(Game.flags[room.name]);
					}) as undefined | StructureContainer
				)?.id
				|| null,
			freeSpawns: roomStructures
				.filter((s): s is Extract<typeof s, StructureSpawn> => s.structureType === STRUCTURE_SPAWN && !s.spawning)
				.map(global.getId),
		});
	}

	return tickCache.get(room.name)!;
}

namespace getCache {
	interface mapStoreObjectArg {
		readonly id: Id<any>;
		readonly store: StoreDefinition;
	}

	export function mapStoreObject(
		{ id, store }: mapStoreObjectArg,
	): { readonly id: Id<any> } & RoomTickCache.Resources.StoreObject {
		const resources: RoomTickCache.Resources.StoreObject["resources"] = {};

		for (const resourceType of Object.keys(store) as Array<ResourceConstant>) {
			const amount = store.getUsedCapacity(resourceType);
			if (amount) {
				resources[resourceType] = { amount };
			}
		}

		return {
			id,
			resources,
		};
	}
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
			tombstones: tombstones.filter(t => resourceType in t.resources),
			ruins: ruins.filter(r => resourceType in r.resources),
			strucutres: strucutres.filter(s => resourceType in s.resources),
		};
	} else {
		return resources;
	}
};

Room.prototype.getConstructionSites = function () {
	return this.getTickCache().constructionSites.map(Game.getObjectById) as Array<ConstructionSite>;
};

Room.prototype.getDamagedStructures = function () {
	return this.getTickCache().damagedStructures.map(Game.getObjectById) as Array<AnyStructure>;
};

export {};

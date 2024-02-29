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

	namespace Room {
		export type RoomResource<R extends ResourceConstant> = Tombstone | Ruin | AnyStoreStructure | Resource<R>
	}

	interface Room {
		scanResources(): RoomMemory.Resources;

		getResources<R extends ResourceConstant = ResourceConstant>(resource?: R): Array<Room.RoomResource<R>>;

		getConstructionSites(): Array<ConstructionSite>;
		getDamagedStructures<
			Walls extends boolean = boolean,
			Ramparts extends boolean = boolean,
			Rest extends boolean = boolean,
		>(filter?: {
			walls?: Walls,
			ramparts?: Ramparts,
			rest?: Rest,
		}): {
			walls: Walls extends true ? Array<StructureWall> : null,
			ramparts: Ramparts extends true ? Array<StructureRampart> : null,
			rest: Rest extends true ? Array<Exclude<AnyStructure, StructureRampart | StructureWall>> : null,
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

interface CachedRoomValue {
	readonly lastUpdated: typeof Game.time;
}

interface CachedRoomResources<R extends ResourceConstant = ResourceConstant> extends CachedRoomValue {
	dropped: Map<R, Array<Id<Resource<R>>>>;
	tombstones: Array<Id<Tombstone>>;
	ruins: Array<Id<Ruin>>;
	structures: Array<Id<Exclude<AnyStoreStructure, StructureSpawn | StructureExtension | StructureTower>>>;
}

const roomResourcesCache = new Map<Room["name"], CachedRoomResources>();

Room.prototype.getResources = function <R extends ResourceConstant = ResourceConstant>(resource: undefined | R = undefined) {
	function filterResources(
		{
			lastUpdated,
			dropped,
			tombstones,
			ruins,
			structures,
		}: CachedRoomResources,
	): null | Array<Room.RoomResource<R>> {
		if (lastUpdated === Game.time) {
			const resources: Array<Room.RoomResource<R>> = [];

			if (resource) {
				if (dropped.has(resource)) {
					resources.push(
						...(dropped.get(resource)!.map(Game.getObjectById) as Array<Resource<R>>),
					);
				}
			} else {
				dropped.forEach(ids => resources.push(...ids.map(Game.getObjectById) as Array<Resource<R>>));
			}

			resources.push(
				...(tombstones.map(Game.getObjectById) as Array<Tombstone>)
					.filter(t => t.store.getUsedCapacity(resource) !== 0),
				...(ruins.map(Game.getObjectById) as Array<Ruin>)
					.filter(r => r.store.getUsedCapacity(resource) !== 0),
				...(structures.map(Game.getObjectById) as Array<AnyStoreStructure>)
					.filter(s => s.store.getUsedCapacity(resource) !== 0),
			);

			return resources;
		} else {
			return null;
		}
	}

	const flag = Game.flags[this.name];

	if (roomResourcesCache.has(this.name)) {
		const resources = filterResources(roomResourcesCache.get(this.name)!);
		if (resources !== null) {
			return resources;
		}
	}

	const droppedResources = this.find(FIND_DROPPED_RESOURCES);
	const tombstones = this.find(FIND_TOMBSTONES);
	const ruins = this.find(FIND_RUINS);
	const structures = this.find(FIND_STRUCTURES, {
		filter: s => ("store" in s) && s.store.getUsedCapacity() !== 0 && !(
			s.structureType === STRUCTURE_SPAWN
			|| s.structureType === STRUCTURE_EXTENSION
			|| s.structureType === STRUCTURE_TOWER
			|| (s.structureType === STRUCTURE_LINK && !flag.pos.isNearTo(s))
		),
	}) as Array<Exclude<AnyStoreStructure, StructureSpawn | StructureExtension | StructureTower>>;

	const dropped: CachedRoomResources["dropped"] = new Map();
	droppedResources.forEach(r => {
		if (!dropped.has(r.resourceType)) {
			dropped.set(r.resourceType, []);
		}

		dropped.get(r.resourceType)!.push(r.id);
	});

	roomResourcesCache.set(this.name, {
		lastUpdated: Game.time,
		dropped,
		tombstones: tombstones.map(global.getId),
		ruins: ruins.map(global.getId),
		structures: structures.map(global.getId),
	});

	return filterResources(roomResourcesCache.get(this.name)!)!;
};

interface CachedConstructionSite extends CachedRoomValue {
	sites: Array<Id<ConstructionSite>>;
}

interface CachedDamagedStructures extends CachedRoomValue {
	walls: Array<Id<StructureWall>>;
	ramparts: Array<Id<StructureRampart>>;
	rest: Array<Id<Exclude<AnyStructure, StructureWall | StructureRampart>>>;
}

const roomConstructionSitesCache = new Map<Room["name"], CachedConstructionSite>();
const roomDamagedStructuresCache = new Map<Room["name"], CachedDamagedStructures>();

Room.prototype.getConstructionSites = function () {
	if (roomConstructionSitesCache.has(this.name)) {
		const { lastUpdated, sites } = roomConstructionSitesCache.get(this.name)!;
		if (lastUpdated === Game.time) {
			return sites.map(Game.getObjectById) as Array<ConstructionSite>;
		}
	}

	const sites = this.find(FIND_MY_CONSTRUCTION_SITES);
	roomConstructionSitesCache.set(this.name, {
		lastUpdated: Game.time,
		sites: sites.map(global.getId),
	});
	return sites;
};

// @ts-expect-error
Room.prototype.getDamagedStructures = function (
	{
		walls: takeWalls = true,
		ramparts: takeRamparts = true,
		rest: takeRest = true,
	} = {},
) {
	if (roomDamagedStructuresCache.has(this.name)) {
		const { lastUpdated, walls, rest, ramparts } = roomDamagedStructuresCache.get(this.name)!;

		if (lastUpdated === Game.time) {
			return {
				walls: takeWalls ? walls.map(Game.getObjectById) : null,
				ramparts: takeRamparts ? ramparts.map(Game.getObjectById) : null,
				rest: takeRest ? rest.map(Game.getObjectById) : null,
			};
		}
	}

	const damaged = this.find(FIND_STRUCTURES, {
		filter: s => s.hits < s.hitsMax,
	});
	const walls = damaged.filter(s => s.structureType === STRUCTURE_WALL) as Array<StructureWall>;
	const ramparts = damaged.filter(s => s.structureType === STRUCTURE_RAMPART) as Array<StructureRampart>;
	const rest = damaged.filter(s => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART) as Array<Exclude<AnyStructure, StructureWall | StructureRampart>>;

	roomDamagedStructuresCache.set(this.name, {
		lastUpdated: Game.time,
		walls: walls.map(global.getId),
		ramparts: ramparts.map(global.getId),
		rest: rest.map(global.getId),
	});

	return {
		walls: takeWalls ? walls : null,
		ramparts: takeRamparts ? ramparts : null,
		rest: takeRest ? rest : null,
	};
};

export {};

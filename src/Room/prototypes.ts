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
		attackTargets: Array<Id<Creep>>;
	}

	interface Room {
		scanResources(): RoomMemory.Resources;

		getConstructionSites(): Array<ConstructionSite>;
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


interface CachedConstructionSite {
	lastUpdated: typeof Game.time;
	sites: Array<Id<ConstructionSite>>;
}

const roomConstructionSitesCache = new Map<Room["name"], CachedConstructionSite>();

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
		sites: sites.map(site => site.id),
	});
	return sites;
};

export {};

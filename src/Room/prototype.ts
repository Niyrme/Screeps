declare global {
	export namespace RoomMemory {
		export namespace Resources {
			export interface Energy {
				miner: null | Id<Creep>;
			}

			export interface Mineral {
			}
		}

		export interface Resources {
			readonly energy: Record<Id<Source>, Resources.Energy>;
			readonly minerals: Record<Id<Mineral>, Resources.Mineral>;
		}

		export type Job = Array<Actions.CreepAction>
	}

	interface RoomMemory {
		resources: RoomMemory.Resources;
		jobs: Array<RoomMemory.Job>;
	}

	interface Room {
		populateMemoryResources(): void;
	}
}

Room.prototype.toString = function () {
	if (this.controller) {
		return `Room(${this.name}, ${this.controller.level}, ${this.controller.owner?.username ?? "<UNOWNED>"})`;
	} else {
		return `Room(${this.name})`;
	}
};

Room.prototype.populateMemoryResources = function () {
	const resources: RoomMemory.Resources = {
		energy: {},
		minerals: {},
	};

	this.find(FIND_SOURCES).forEach(source => {
		if (source.id in this.memory.resources.energy) {
			resources.energy[source.id] = this.memory.resources.energy[source.id];
		} else {
			resources.energy[source.id] = {
				miner: null,
			};
		}
	});
	this.find(FIND_MINERALS).forEach(mineral => {
		resources.minerals[mineral.id] = {};
	});

	this.memory.resources = resources;
};

export {};

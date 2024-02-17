declare global {
	export namespace RoomMemory {
		export namespace Resources {
			export interface Energy {
				addContainer: boolean;
			}

			export interface Mineral {
			}
		}

		export interface Resources {
			readonly energy: Record<Id<Source>, Resources.Energy>;
			readonly minerals: Record<Id<Mineral>, Resources.Mineral>;
		}
	}

	interface RoomMemory {
		resources: RoomMemory.Resources;
		attackTarget: null | Id<Creep>;
		healTarget: null | Id<Creep>;
		repairTarget: null | Id<AnyStructure>;
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

	this.find(FIND_SOURCES).forEach((source, idx) => {
		resources.energy[source.id] = {
			addContainer: (this.controller?.my && this.controller.level > idx) ?? false,
		};
	});
	this.find(FIND_MINERALS).forEach(mineral => {
		resources.minerals[mineral.id] = {};
	});

	this.memory.resources = resources;
};

export {};

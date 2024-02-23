declare global {
	interface RoomMemory {
		lastRCL: number;
	}

	interface Room {
		getResources(): RoomResources.Resources;
	}
}

Room.prototype.toString = function () {
	if (this.controller) {
		return `Room(${this.name}, ${this.controller.level}, ${this.controller.owner?.username ?? "<UNOWNED>"})`;
	} else {
		return `Room(${this.name})`;
	}
};

namespace RoomResources {
	interface Energy {}

	interface Minerals {}

	export interface Resources {
		energy: Map<Id<Source>, Energy>;
		minerals: Map<Id<Mineral>, Minerals>;
	}
}

const RoomResources: Map<Room["name"], RoomResources.Resources> = new Map();

Room.prototype.getResources = function () {
	if (!RoomResources.has(this.name)) {
		const resources: RoomResources.Resources = {
			energy: new Map(),
			minerals: new Map(),
		};

		for (const source of this.find(FIND_SOURCES)) {
			resources.energy.set(source.id, {});
		}
		for (const mineral of this.find(FIND_MINERALS)) {
			resources.minerals.set(mineral.id, {});
		}

		RoomResources.set(this.name, resources);
	}

	return RoomResources.get(this.name)!;
};

export {};

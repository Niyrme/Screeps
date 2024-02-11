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
		mineral: {},
	};

	for (const source of this.find(FIND_SOURCES)) {
		resources.energy[source.id] = {};
	}
	for (const mineral of this.find(FIND_MINERALS)) {
		resources.mineral[mineral.id] = {};
	}

	this.memory.resources = resources;
};

export {};

declare global {
	interface RoomMemory {
		RCL: number;
		attackTargets: Array<Id<Creep>>;
	}

	interface Room {
	}
}

Room.prototype.toString = function () {
	if (this.controller) {
		return `Room(${this.name}, ${this.controller.level}, ${this.controller.owner?.username ?? "<UNOWNED>"})`;
	} else {
		return `Room(${this.name})`;
	}
};

export {};

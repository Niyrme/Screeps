declare global {
	interface CreepMemory {}

	interface Creep {}

	interface CreepConstructor {}
}

Creep.prototype.toString = function () {
	return `Creep(${this.name}, ${this.room.name})`;
};

export {};

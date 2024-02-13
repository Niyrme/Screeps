declare global {
	interface CreepMemory {
		readonly role: string;
	}

	interface Creep {
	}

	interface CreepConstructor {
		find(name: string): null | Creep;
	}
}

Creep.find = function (name) {
	if (name in Game.creeps) {
		return Game.creeps[name];
	} else {
		return null;
	}
};

export {};

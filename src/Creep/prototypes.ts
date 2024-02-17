export interface CreepName {
	spawnTime: number;
	role: string;
}

export type EncodeMemory = Omit<CreepName, "spawnTime">

declare global {
	interface CreepConstructor {
		find(name: string): null | Creep;

		encodeMemory<M extends EncodeMemory>(memory: M): string;
	}

	interface CreepMemory {
	}

	interface Creep {
		decodeName(): Readonly<CreepName>;
	}
}

Creep.find = function (name) {
	if (name in Game.creeps) {
		return Game.creeps[name];
	} else {
		return null;
	}
};

Creep.encodeMemory = function ({ role }) {
	const roleId = parseInt(_.findKey(Memory.roleMap, roleName => roleName === role)).toString(36)

	return `${roleId}`
};

Creep.prototype.toString = function () {
	return `Creep(${this.name})`;
};

Creep.prototype.decodeName = function () {
	const [timeStamp, encoded] = this.name.split("|");
	const [roleId] = encoded.split("").map(char => parseInt(char, 36));

	return {
		spawnTime: parseInt(timeStamp, 36),
		role: Memory.roleMap[roleId],
	};
};

export {};

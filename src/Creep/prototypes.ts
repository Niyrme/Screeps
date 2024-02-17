// [timestamp]/[1:role]
export interface CreepName {
	spawnTime: number;
	role: string;
}

export type EncodeMemory = Omit<CreepName, "spawnTime">

declare global {
	interface CreepConstructor {
		encodeMemory<M extends EncodeMemory>(memory: M): string;
	}

	interface CreepMemory {
		readonly home: string;
		recycleSelf: boolean;
	}

	interface Creep {
		decodeName(): Readonly<CreepName>;
	}
}

Creep.encodeMemory = function ({ role }) {
	const roleId = parseInt(_.findKey(Memory.roleMap, roleName => roleName === role)).toString(36);

	return `${roleId}`;
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

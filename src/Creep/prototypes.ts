declare global {
	interface CreepName {
		spawnTime: number;
		role: keyof AllRoles;
	}

	interface CreepMemory {
		readonly home: Room["name"];
		recycleSelf: boolean;
	}

	interface Creep {
		decodeName(): CreepName;
	}

	interface CreepConstructor {
		encodeName(name: CreepName): string;
		getBodyCost(body: Array<BodyPartConstant>): number;
	}
}

Creep.encodeName = ({ spawnTime, role }) => `${spawnTime.toString(36)}/` + [
	parseInt(_.findKey(Memory.roleMap, name => name === role)),
].map((v: any) => (typeof v === "number") ? v.toString(36) : v).join("-");

Creep.getBodyCost = body => body.reduce((cost, part) => cost + BODYPART_COST[part], 0);

Creep.prototype.toString = function () {
	return `Creep(${this.name}, ${this.room.name})`;
};

Creep.prototype.decodeName = function () {
	const [, time, roleID] = /^([a-z0-9]+)\/([a-z0-9]+)/.exec(this.name)!;

	return {
		spawnTime: parseInt(time, 36),
		role: Memory.roleMap[parseInt(roleID, 36)],
	};
};

export {};

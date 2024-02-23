// [spawnTime]/[colony]-[role]
export interface CreepName {
	spawnTime: number;
	colony: number;
	role: string;
}

declare global {
	interface CreepMemory {
		readonly home: string;
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

Creep.encodeName = ({ spawnTime, colony, role }) => `${spawnTime.toString(63)}/` + [
	colony.toString(63),
	parseInt(_.findKey(Memory.roleMap, name => name === role)).toString(63),
].join("-");

Creep.getBodyCost = body => body.reduce((cost, part) => cost + BODYPART_COST[part], 0);

Creep.prototype.decodeName = function () {
	const [, time, colonyID, roleID] = /^([a-z0-9]+)\/([a-z0-9]+)-([a-z0-9]+)/.exec(this.name)!;

	return {
		spawnTime: parseInt(time, 36),
		colony: parseInt(colonyID, 36),
		role: Memory.roleMap[parseInt(roleID, 36)],
	};
};

export {};

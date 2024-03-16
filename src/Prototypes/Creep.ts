declare global {
	interface CreepMemory {
		readonly home: Room["name"];
	}

	interface Creep {
	}

	interface CreepConstructor {
		getBodyCost(body: Array<BodyPartConstant>): number;
	}
}

Creep.getBodyCost = body => body.reduce((cost, part) => cost + BODYPART_COST[part], 0);

export {};

declare global {
	interface CreepMemory {}

	interface Creep {}

	interface CreepConstructor {
		getBodyCost(body: Array<BodyPartConstant>): number;
	}
}

Creep.getBodyCost = body => body.reduce((acc, part) => acc + BODYPART_COST[part], 0);

export {};

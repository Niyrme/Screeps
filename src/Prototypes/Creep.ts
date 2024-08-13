export const enum CreepRole {
	Harvester,
	Upgrader,
	Builder,
	Repairer,
}

declare global {
	interface CreepMemory {
		role: CreepRole;
		junkData: Record<any, any>;
	}
}

export {};

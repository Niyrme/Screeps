export {};

declare global {
	interface CreepMemory {
		readonly role: string;
		readonly homeRoom: string;
	}

	interface Creep {
		collectEnergy(fromStorage?: boolean): ScreepsReturnCode;
	}
}

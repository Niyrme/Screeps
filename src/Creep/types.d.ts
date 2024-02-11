export {};

declare global {
	interface CreepMemory {
		readonly role: string;
		readonly homeRoom: string;
		pickupSource?:
			| { type: "dropped", resource: Id<Resource<RESOURCE_ENERGY>> }
			| { type: "structure", structure: Id<(Structure & HasStore) | Tombstone | Ruin> };
	}

	interface Creep {
		collectEnergy(fromStorage?: boolean): ScreepsReturnCode;

		recycleSelf(): ScreepsReturnCode;
	}
}

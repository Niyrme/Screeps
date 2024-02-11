export {};

declare global {
	interface CreepMemory {
		readonly role: string;
		readonly homeRoom: string;
		pickupSource?:
			| { type: "dropped", resource: Id<Resource<RESOURCE_ENERGY>> }
			| { type: "structure", structure: Id<(Structure | Tombstone | Ruin) & HasStore<RESOURCE_ENERGY>> };
	}

	interface Creep {
		collectEnergy(fromStorage?: boolean): ScreepsReturnCode;

		recycleSelf(): ScreepsReturnCode;
	}
}

import type { AnyRole } from "./roles/types";

declare global {
	type ScreepsErrorCode = Exclude<ScreepsReturnCode, OK>

	interface CustomMemory {
		debug: boolean;
		creepID: number;
	}

	// global memory
	interface Memory extends CustomMemory {
	}

	// creep memory
	interface CreepMemory {
		role: AnyRole["name"];
	}

	interface RoomMemory {
		// buildQueue: PriorityArray<Id<ConstructionSite>>;
		// repairQueue: PriorityArray<Id<AnyStructure>>;
	}
}

export {};

import type { AnyRole } from "./roles/types";

declare global {
	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>

	type ScreepsErrorCode = Exclude<ScreepsReturnCode, OK>

	interface CustomMemory {
		debug: boolean;
		creepID: number;
		visuals: boolean;
	}

	// global memory
	interface Memory extends CustomMemory {
	}

	// creep memory
	interface CreepMemory {
		role: AnyRole["name"];
		stage?: number;
	}

	interface RoomMemory {
		minBuild: number;
		minHarvest: number;
		minRepair: number;
		minUpgrade: number;
		// buildQueue: PriorityArray<Id<ConstructionSite>>;
		// repairQueue: PriorityArray<Id<AnyStructure>>;
	}
}

export {};

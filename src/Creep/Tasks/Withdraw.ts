import type { Task } from "./_base.ts";

export interface WithdrawTask extends Task<"withdraw"> {
	readonly structure: Id<Exclude<AnyStoreStructure, StructureSpawn | StructureExtension | StructureTower>>;
	readonly resource: ResourceConstant;
	readonly amount: number;
}

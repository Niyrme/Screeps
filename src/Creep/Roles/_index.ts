import type { ActionCreepMemory } from "Creep";

export * from "./Attack.ts";
export * from "./Build.ts";
export * from "./Claim.ts";
export * from "./Explore.ts";
export * from "./Haul.ts";
export * from "./Heal.ts";
export * from "./Mine.ts";
export * from "./Repair.ts";
export * from "./Reserve.ts";
export * from "./Upgrade.ts";

export interface CreepRole {
	RoleName: string;
	spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType;
	getActions(creep: Creep): ActionCreepMemory["_actionSteps"];
}

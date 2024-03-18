import type { EventBody } from "Global";

export interface CreepEvent extends EventBody {
	readonly creep: Creep;
}

export interface CreepNameEvent extends EventBody {
	readonly name: Creep["name"];
}

export interface EventCreepDied extends CreepNameEvent {
	readonly memory: CreepMemory;
}

export interface EventCreepSpawned extends CreepNameEvent {
	readonly spawn: StructureSpawn;
}

export const EVENT_CREEP_DIED = "creep-died";
export const EVENT_CREEP_SPAWNED = "creep-spawned";

declare global {
	export interface IEventBusEvents {
		[EVENT_CREEP_DIED]: EventCreepDied;
		[EVENT_CREEP_SPAWNED]: EventCreepSpawned;
	}
}

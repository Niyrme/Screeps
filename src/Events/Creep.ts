import type { EventBody, EventCallback } from "Global";

export interface EventCreepDied extends EventBody {
	readonly name: Creep["name"];
	readonly memory: CreepMemory;
}

export interface EventCreepSpawned extends EventBody {
	readonly name: Creep["name"];
	readonly spawn: StructureSpawn;
}

export const EVENT_CREEP_DIED = "creep-died" as const;
export const EVENT_CREEP_SPAWNED = "creep-spawned" as const;

declare global {
	export interface IEventBus {
		subscribe(name: typeof EVENT_CREEP_DIED, callback: EventCallback<EventCreepDied>): void;
		subscribe(name: typeof EVENT_CREEP_SPAWNED, callback: EventCallback<EventCreepSpawned>): void;
	}

	export interface IEventBus {
		trigger(name: typeof EVENT_CREEP_DIED, eventBody: EventCreepDied): void;
		trigger(name: typeof EVENT_CREEP_SPAWNED, eventBody: EventCreepSpawned): void;
	}
}

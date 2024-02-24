declare global {
	export namespace IEventBus {
		export namespace Creep {
			export namespace Died {
				export type EventName = "creep-died"

				export interface EventBody {
					readonly name: Creep["name"];
					readonly memory: CreepMemory;
				}
			}

			export namespace Spawned {
				export type EventName = "creep-spawned"

				export interface EventBody {
					readonly name: Creep["name"];
					readonly spawn: Id<StructureSpawn>;
				}
			}
		}
	}

	interface IEventBus {
		subscribe(name: IEventBus.Creep.Died.EventName, callback: (eventBody: IEventBus.Creep.Died.EventBody) => void): void;
		subscribe(name: IEventBus.Creep.Spawned.EventName, callback: (eventBody: IEventBus.Creep.Spawned.EventBody) => void): void;

		trigger(name: IEventBus.Creep.Died.EventName, eventBody: IEventBus.Creep.Died.EventBody): void;
		trigger(name: IEventBus.Creep.Spawned.EventName, eventBody: IEventBus.Creep.Spawned.EventBody): void;
	}
}

export const EVENT_CREEP_DIED: IEventBus.Creep.Died.EventName = "creep-died";
export const EVENT_CREEP_SPAWNED: IEventBus.Creep.Spawned.EventName = "creep-spawned";

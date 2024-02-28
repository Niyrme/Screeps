declare global {
	export namespace IEventBus {
		export namespace Room {
			export namespace Attacked {
				export type EventName = "room-attacked"

				export interface EventBody {
					readonly room: Room["name"];
					readonly creep: Id<Creep | PowerCreep | StructureTower>;
				}
			}

			export namespace RCLChange {
				export type EventName = "room-rcl-change"

				export interface EventBody {
					readonly room: Room["name"];
					readonly old: number;
					readonly new: number;
				}
			}
		}
	}

	interface IEventBus {
		subscribe(name: IEventBus.Room.Attacked.EventName, callback: (eventBody: IEventBus.Room.Attacked.EventBody) => void): void;
		subscribe(name: IEventBus.Room.RCLChange.EventName, callback: (eventBody: IEventBus.Room.RCLChange.EventBody) => void): void;

		trigger(name: IEventBus.Room.Attacked.EventName, eventBody: IEventBus.Room.Attacked.EventBody): void;
		trigger(name: IEventBus.Room.RCLChange.EventName, eventBody: IEventBus.Room.RCLChange.EventBody): void;
	}
}

export const EVENT_ROOM_ATTACKED: IEventBus.Room.Attacked.EventName = "room-attacked";
export const EVENT_ROOM_RCL_CHANGE: IEventBus.Room.RCLChange.EventName = "room-rcl-change";

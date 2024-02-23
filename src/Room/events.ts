declare global {
	export namespace IEventBus {
		export namespace Room {
			export namespace Attacked {
				export type EventName = "room-attacked"

				export interface EventBody {
					creep: Id<Creep>;
				}
			}

			export namespace RCLChange {
				export type EventName = "room-rcl-change"

				export interface EventBody {
					old: number;
					new: number;
				}
			}
		}
	}

	interface IEventBus {
		subscribe(name: IEventBus.Room.Attacked.EventName, callback: (room: Room["name"], eventBody: IEventBus.Room.Attacked.EventBody) => void): void;
		subscribe(name: IEventBus.Room.RCLChange.EventName, callback: (room: Room["name"], eventBody: IEventBus.Room.RCLChange.EventBody) => void): void;

		trigger(name: IEventBus.Room.Attacked.EventName, room: Room["name"], eventBody: IEventBus.Room.Attacked.EventBody): void;
		trigger(name: IEventBus.Room.RCLChange.EventName, room: Room["name"], eventBody: IEventBus.Room.RCLChange.EventBody): void;
	}
}

export const EVENT_ROOM_ATTACKED: IEventBus.Room.Attacked.EventName = "room-attacked";
export const EVENT_ROOM_RCL_CHANGE: IEventBus.Room.RCLChange.EventName = "room-rcl-change";

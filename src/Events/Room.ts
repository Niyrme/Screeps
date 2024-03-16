import type { EventBody, EventCallback } from "Global";

interface RoomEvent extends EventBody {
	readonly room: Room;
}

export interface EventRoomAttacked extends RoomEvent {
	readonly attacker: Creep | PowerCreep | StructureTower;
}

export interface EventRoomClaimed extends RoomEvent {
}

export interface EventRoomRCLChanged {
	readonly oldLevel: number;
	readonly newLevel: number;
}

export const EVENT_ROOM_ATTACKED = "room-attacked" as const;
export const EVENT_ROOM_CLAIMED = "room-claimed" as const;
export const EVENT_ROOM_RCL_CHANGED = "room-rcl-changed" as const;

declare global {
	export interface IEventBus {
		subscribe(name: typeof EVENT_ROOM_ATTACKED, callback: EventCallback<EventRoomAttacked>): void;
		subscribe(name: typeof EVENT_ROOM_CLAIMED, callback: EventCallback<EventRoomClaimed>): void;
		subscribe(name: typeof EVENT_ROOM_RCL_CHANGED, callback: EventCallback<EventRoomRCLChanged>): void;
	}

	export interface IEventBus {
		trigger(name: typeof EVENT_ROOM_ATTACKED, eventBody: EventRoomAttacked): void;
		trigger(name: typeof EVENT_ROOM_CLAIMED, eventBody: EventRoomClaimed): void;
		trigger(name: typeof EVENT_ROOM_RCL_CHANGED, eventBody: EventRoomRCLChanged): void;
	}
}

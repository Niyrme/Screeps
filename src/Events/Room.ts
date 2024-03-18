import type { EventBody } from "Global";

interface RoomEvent extends EventBody {
	readonly room: Room;
}

export interface EventRoomAttacked extends RoomEvent {
	readonly attacker: Creep | PowerCreep | StructureTower;
}

export interface EventRoomClaimed extends RoomEvent {
}

export interface EventRoomRCLChanged extends RoomEvent {
	readonly oldLevel: number;
	readonly newLevel: number;
}

export const EVENT_ROOM_ATTACKED = "room-attacked";
export const EVENT_ROOM_CLAIMED = "room-claimed";
export const EVENT_ROOM_RCL_CHANGE = "room-rcl-change";

declare global {
	export interface IEventBusEvents {
		[EVENT_ROOM_ATTACKED]: EventRoomAttacked,
		[EVENT_ROOM_CLAIMED]: EventRoomClaimed,
		[EVENT_ROOM_RCL_CHANGE]: EventRoomRCLChanged,
	}
}

import "./prototypes.ts";
import { EVENT_ROOM_ATTACKED, EVENT_ROOM_RCL_CHANGE } from "./events.ts";
import {
	roomHandlerConstruction,
	roomHandlerEvents,
	roomHandlerSpawning,
	roomHandlerTowers,
} from "./handlers/_index.ts";

export * from "./events.ts";

export function roomManager(room: Room) {
	if (!room.memory.attackTargets) {
		room.memory.attackTargets = [];
	}

	roomHandlerEvents(room);
	roomHandlerTowers(room);
	roomHandlerSpawning(room);
}

export namespace roomManager {
	export const placeConstructionSites = roomHandlerConstruction;
}

global.EventBus.subscribe(EVENT_ROOM_ATTACKED, ({ room: roomName, creep: creepID }) => {
	const room = Game.rooms[roomName];
	if (!room.controller?.my) { return; }

	if (!_.contains(room.memory.attackTargets, creepID)) {
		room.memory.attackTargets.push(creepID);
	}
});

global.EventBus.subscribe(EVENT_ROOM_RCL_CHANGE, ({ room: roomName, old, new: newLevel }) => {
	const room = Game.rooms[roomName];

	if (!room.controller?.my) { return; }

	if (newLevel > old) {
		roomHandlerConstruction(room);
	}
});

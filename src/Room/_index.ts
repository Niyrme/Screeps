import "./prototypes.ts";
import { EVENT_ROOM_ATTACKED, EVENT_ROOM_RCL_CHANGE } from "Events";
import {
	roomHandlerConstruction,
	roomHandlerEvents,
	roomHandlerLinks,
	roomHandlerSpawning,
	roomHandlerTowers,
	roomHandlerVisuals,
} from "./handlers/_index.ts";

export function roomManager(room: Room) {
	if (!room.memory.attackTargets) {
		room.memory.attackTargets = [];
	}

	roomHandlerEvents(room);
	roomHandlerTowers(room);
	roomHandlerSpawning(room);
	room.memory.visuals && roomHandlerVisuals(room);
	roomHandlerLinks(room);
}

export namespace roomManager {
	export const placeConstructionSites = roomHandlerConstruction;
}

global.EventBus.subscribe(EVENT_ROOM_ATTACKED, ({ room, attacker }) => {
	if (!room.controller?.my) { return; }

	if (!attacker) {
		return;
	} else if (attacker.my) {
		return;
	} else if ("structureType" in attacker) {
		return;
	}

	if (!_.contains(room.memory.attackTargets, attacker.id)) {
		room.memory.attackTargets.push(attacker.id as Id<Exclude<typeof attacker, StructureTower>>);
	}
});

global.EventBus.subscribe(EVENT_ROOM_RCL_CHANGE, ({ room, oldLevel, newLevel }) => {
	if (!room.controller?.my) { return; }

	if (newLevel > oldLevel) {
		roomHandlerConstruction(room);
	}
});

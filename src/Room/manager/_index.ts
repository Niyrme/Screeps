import { Logging } from "util";
import { roomConstruction } from "./construction.ts";
import { roomDefense } from "./defense.ts";
import { roomSpawning } from "./spawning.ts";

export function manageRoom(room: Room) {
	if (!room.controller?.my) {
		return;
	}

	if (!(room.name in Game.flags)) {
		Logging.error(`${room} is missing center flag`);
		return;
	}

	roomDefense(room);
	if (Game.time % 500 === 0) {
		roomConstruction(room);
	}
	roomSpawning(room);
}

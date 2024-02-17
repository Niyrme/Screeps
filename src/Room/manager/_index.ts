import { Logging } from "util";
import { roomConstruction } from "./construction.ts";
import { roomDefense } from "./defense.ts";
import { roomHeal } from "./heal.ts";
import { roomRepair } from "./repair.ts";
import { roomSpawning } from "./spawning.ts";

(function initialSetup() {
	_.forEach(Game.rooms, room => {
		room.memory.attackTarget = null;
		room.memory.healTarget = null;
		room.memory.repairTarget = null;
		room.populateMemoryResources();
		roomConstruction(room);
	});
})();

export function manageRoom(room: Room) {
	if (!room.controller?.my) {
		return;
	}

	room.visual.text(
		`${room.controller.progress / room.controller.progressTotal}%`,
		room.controller.pos.x,
		room.controller.pos.y - 1,
		{ align: "center" },
	);

	if (!(room.name in Game.flags)) {
		Logging.error(`${room} is missing center flag`);
		return;
	}

	roomDefense(room);
	roomHeal(room);
	roomRepair(room);
	if (Game.time % 500 === 0) {
		roomConstruction(room);
	}
	roomSpawning(room);
}

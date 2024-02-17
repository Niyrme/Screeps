import { catchNotImplemented, Logging } from "util";
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
		`${((1 - (room.controller.progress / room.controller.progressTotal)) * 100).toFixed(3)}%`,
		room.controller.pos.x,
		room.controller.pos.y - 1,
		{ align: "center" },
	);

	for (const spawn of room.find(FIND_MY_SPAWNS, { filter: s => !!s.spawning })) {
		room.visual.text(
			`${spawn.spawning!.name} | ${((1 - (spawn.spawning!.remainingTime / spawn.spawning!.needTime)) * 100).toFixed(1)}%`,
			spawn.pos.x,
			spawn.pos.y - 1,
			{ align: "center" },
		);
	}

	if (!(room.name in Game.flags)) {
		Logging.error(`${room} is missing center flag`);
		return;
	}

	catchNotImplemented(() => roomDefense(room));
	catchNotImplemented(() => roomDefense(room));
	catchNotImplemented(() => roomHeal(room));
	catchNotImplemented(() => roomRepair(room));

	if (Game.time % 500 === 0) {
		catchNotImplemented(() => roomConstruction(room));
	}
	catchNotImplemented(() => roomSpawning(room));
}

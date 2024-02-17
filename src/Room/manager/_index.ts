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

	if (!(room.name in Game.flags)) {
		Logging.error(`${room} is missing center flag`);
		return;
	}

	catchNotImplemented(() => roomDefense(room));
	catchNotImplemented(() => roomDefense(room));
	catchNotImplemented(() => roomHeal(room));
	catchNotImplemented(() => roomRepair(room));

	if (Game.time % 2500 === 0) {
		catchNotImplemented(() => roomConstruction(room));
	}
	catchNotImplemented(() => roomSpawning(room));

	room.visual.text(
		`${((room.controller.progress / room.controller.progressTotal) * 100).toFixed(3)}%`,
		room.controller.pos.x,
		room.controller.pos.y - 1,
		{ align: "center" },
	);

	for (const spawn of room.find(FIND_MY_SPAWNS, { filter: s => !!s.spawning })) {
		room.visual.text(
			`${((1 - (spawn.spawning!.remainingTime / spawn.spawning!.needTime)) * 100).toFixed(1)}%`,
			spawn.pos.x,
			spawn.pos.y - 1,
			{ align: "center" },
		);
	}
	for (const id of Object.keys(room.memory.resources.energy)) {
		const source = Game.getObjectById(id)!;
		room.visual.text(
			`${((source.energy / source.energyCapacity) * 100).toFixed(1)}%`,
			source.pos.x,
			source.pos.y - 0.5,
			{ align: "center" },
		);
		room.visual.text(
			`${source.ticksToRegeneration}t`,
			source.pos.x,
			source.pos.y + 1,
			{ align: "center" },
		);
	}
}

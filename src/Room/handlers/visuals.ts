export function roomHandlerVisuals(room: Room) {
	if (!room.controller?.my) { return; }

	room.visual.text(
		`${((room.controller.progress / room.controller.progressTotal) * 100).toFixed(3)}%`,
		room.controller.pos.x,
		room.controller.pos.y - 1,
		{ align: "center" },
	);

	for (const spawn of room.find(FIND_MY_SPAWNS)) {
		if (spawn.spawning) {
			room.visual.text(
				`${(((spawn.spawning.remainingTime + 1) / spawn.spawning.needTime) * 100).toFixed(1)}%`,
				spawn.pos.x,
				spawn.pos.y - 1,
				{ align: "center" },
			);
		}
	}

	for (const source of room.find(FIND_SOURCES)) {
		room.visual.text(
			`${((source.energy / source.energyCapacity) * 100).toFixed(2)}%`,
			source.pos.x,
			source.pos.y - 0.5,
			{ align: "center" },
		);
		room.visual.text(
			`${(source.ticksToRegeneration - 1) || 0}T`,
			source.pos.x,
			source.pos.y + 1,
			{ align: "center" },
		);
	}
}

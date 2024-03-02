export function roomHandlerVisuals(room: Room) {
	if (!room.controller?.my) { return; }

	const visual = new RoomVisual(room.name);

	visual.text(
		`${(room.controller.progressTotal - room.controller.progress)}`,
		room.controller.pos.x,
		room.controller.pos.y - 1,
		{ align: "center" },
	);

	for (const spawn of room.find(FIND_MY_SPAWNS)) {
		if (spawn.spawning) {
			visual.text(
				`${spawn.spawning.remainingTime - 1}`,
				spawn.pos.x,
				spawn.pos.y - 1,
				{ align: "center" },
			);
		}
	}

	for (const source of room.find(FIND_SOURCES)) {
		visual.text(
			`${((source.energy / source.energyCapacity) * 100).toFixed(2)}%`,
			source.pos.x,
			source.pos.y - 0.5,
			{ align: "center" },
		);
		visual.text(
			`${(source.ticksToRegeneration - 1) || 0}T`,
			source.pos.x,
			source.pos.y + 1,
			{ align: "center" },
		);
	}
}

const getRandomName = () => `${Game.time.toString(36)}_${Math.floor(Math.random() * 100000).toString(36)}`;

export default function (room: Room) {
	const { spawnQueue: queue } = room;

	if (!queue.empty) {
		const spawns = room.find(FIND_MY_SPAWNS, {
			filter: s => !s.spawning,
		});

		for (const spawn of spawns) {
			const item = queue.popIfOk(({ body, name, opts }) => spawn.spawnCreep(
				body,
				name ?? getRandomName(),
				{ ...opts, dryRun: true },
			));
			if (!item) { break; }

			const { name, body, opts } = item;
			spawn.spawnCreep(body, name ?? getRandomName(), { ...opts, dryRun: false });
		}
	}
}

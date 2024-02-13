import { Logging, NotImplementedError } from "util";

function findRoad(room: Room, dest: RoomPosition, opts: FindPathOpts = {}): Array<PathStep> {
	return room.findPath(Game.flags[room.name]!.pos, dest, { ...findRoadOpts, ...opts });
}

const findRoadOpts: FindPathOpts = {
	range: 1,
	ignoreCreeps: true,
};

const buildStages: Record<number, (room: Room) => void> = {
	1: function (room) {
		const base = Game.flags[room.name]!;

		base.pos.tryPutConstructionSite(STRUCTURE_CONTAINER);

		const spawns = room.find(FIND_MY_SPAWNS);
		const sources = room.find(FIND_SOURCES);
		const controller = room.controller!;

		const sourcesPaths = sources.map(source => findRoad(room, source.pos));
		const paths: Array<Array<PathStep>> = [
			findRoad(room, controller.pos),
			...spawns.map(spawn => findRoad(room, spawn.pos)),
		];

		paths.sort(({ length: p1 }, { length: p2 }) => Number(p2 > p1) - Number(p2 < p1));

		for (const path of paths) {
			for (const { x, y } of path) {
				room.getPositionAt(x, y)?.tryPutConstructionSite(STRUCTURE_ROAD);
			}
		}

		for (const path of sourcesPaths) {
			const containerStep = path.pop();
			if (containerStep) {
				room.getPositionAt(containerStep.x, containerStep.y)?.tryPutConstructionSite(STRUCTURE_CONTAINER);
			}
		}
	},
	2: function (room) {
		// const base = Game.flags[room.name]!;
		throw new NotImplementedError("buildStages[2]");
	},
	3: function (room) {
		// const base = Game.flags[room.name]!;
		throw new NotImplementedError("buildStages[3]");
	},
	4: function (room) {
		const base = Game.flags[room.name]!;
		const storagePos = room.getPositionAt(base.pos.x, base.pos.y - 1);
		storagePos?.tryPutConstructionSite(STRUCTURE_STORAGE);
		throw new NotImplementedError("buildStages[4]");
	},
	5: function (room) {
		const base = Game.flags[room.name]!;
		const baseLinkPos = room.getPositionAt(base.pos.x, base.pos.y + 1);
		baseLinkPos?.tryPutConstructionSite(STRUCTURE_LINK);
		throw new NotImplementedError("buildStages[5]");
	},
	6: function (room) {
		// const base = Game.flags[room.name]!;
		throw new NotImplementedError("buildStages[6]");
	},
	7: function (room) {
		// const base = Game.flags[room.name]!;
		throw new NotImplementedError("buildStages[7]");
	},
	8: function (room) {
		// const base = Game.flags[room.name]!;
		throw new NotImplementedError("buildStages[8]");
	},
};

export function roomConstruction(room: Room) {
	if (!room.controller?.my) {
		return;
	}

	try {
		for (let i = 0; i <= room.controller.level; i++) {
			buildStages[room.controller.level](room);
		}
	} catch (err) {
		if (err instanceof NotImplementedError) {
			Logging.error(err.message);
		} else {
			throw err;
		}
	}
}

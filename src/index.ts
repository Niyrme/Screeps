// include all utils
import "./util/_all.ts";
// include all prototypes
import "./prototypes/_all.ts";
import { Roles } from "./roles/_all.ts";
import { Logging, mergeWeak } from "./util/_all.ts";

mergeWeak(Memory, {
	debug: false,
	creepID: 0,
	visuals: false,
} as CustomMemory);

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}

	for (const name in Game.rooms) {
		const room = Game.rooms[name];

		mergeWeak(room.memory, {
			minHarvest: 2,
			minBuild: 4,
			minRepair: 2,
			minUpgrade: 1,
		} as RoomMemory);

		room.spawnCreeps();
		room.queueConstructionSites();
		room.queueRepairs();
	}

	for (const name in Game.creeps) {
		const creep = Game.creeps[name];

		try {
			Roles[creep.memory.role](creep as unknown as any);
		} catch (err) {
			Logging.error(creep.formatContext(), err.toString());
		}
	}
}

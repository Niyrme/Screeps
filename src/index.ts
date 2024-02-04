// include all utils
import "./util/_all.ts";
// include all prototypes
import "./prototypes/_all.ts";
import { mergeWeak } from "./util/_all.ts";

mergeWeak(Memory, {
	debug: false,
	creepID: 0,
} as CustomMemory);

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}

	for (const name in Game.rooms) {
		const room = Game.rooms[name];

		room.queueConstructionSites();
		room.queueRepairs();
	}

	for (const name in Game.creeps) {
		const creep = Game.creeps[name];
	}
}

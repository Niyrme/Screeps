import "./Creep/_index.ts";
import "./Room/_index.ts";
import "./StructureSpawn/_index.ts";
import { manageCreep, manageRoom } from "./managers.ts";
import { mergeWeak } from "./util.ts";

mergeWeak(Memory, {
	debug: false,
	creepID: 0,
	visuals: false,
} as CustomMemory);

export function loop() {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}

	_.forEach(Game.rooms, manageRoom);
	_.forEach(Game.creeps, manageCreep);
}

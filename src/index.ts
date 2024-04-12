import "Global";
import "Lib";
import "Prototypes";
import { handleCreep, handleRoom } from "Handlers";
import { profiler } from "Lib";

import { SourceMapper } from "SourceMapper";

profiler.enable();

export const loop = SourceMapper(() => profiler.wrap(() => {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}

	_.forEach(Game.rooms, handleRoom);
	_.forEach(Game.creeps, handleCreep);
}));

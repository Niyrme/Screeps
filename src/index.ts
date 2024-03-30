import "Global";
import "Lib";
import { profiler } from "Lib";

import { SourceMapper } from "SourceMapper";

profiler.enable();

export const loop = SourceMapper(() => {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
});

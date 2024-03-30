import "Global";
import "Lib";

import { SourceMapper } from "SourceMapper";

export const loop = SourceMapper(() => {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
});

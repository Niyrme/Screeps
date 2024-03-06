import "Global";
import "Lib";
import "Cache";

import "Creep";
import "Room";
import "StructureSpawn";

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
}

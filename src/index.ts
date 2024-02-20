import "Prototype";
import "Lib";

import "StructureSpawn";
import "RoomPosition";
import { creepHandler } from "Creep";
import { roomHandler } from "Room";
import { mergeWeak } from "Util";

(function initialMemorySetup() {
	mergeWeak(
		// @ts-ignore
		Memory,
		{
			debug: false,
			creepID: 0,
		} as CustomMemory,
	);
})();

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}

	_.forEach(Game.rooms, roomHandler);
	_.forEach(Game.creeps, creepHandler);
}

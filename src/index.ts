import "Prototype";
import "Lib";

import "StructureSpawn";
import "RoomPosition";
import { creepHandler } from "Creep";
import { RoomHandler } from "Room";
import { mergeWeak } from "Utils";

(function initialMemorySetup() {
	mergeWeak(
		// @ts-ignore
		Memory,
		{
			debug: false,
			creepID: 0,
			colonyID: 0,
			roleMap: {},
		} as CustomMemory,
	);
})();

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}

	_.forEach(Game.rooms, room => (new RoomHandler(room)).execute());
	_.forEach(Game.creeps, creepHandler);
}

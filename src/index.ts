import "EventBus";
import "Prototype";
import "Lib";

import "Creep";
import "Room";
import "StructureSpawn";
import { RoomHandler } from "Room";

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		} else {
			const creep = Game.creeps[name];
			// TODO
		}
	}

	_.forEach(Game.rooms, room => (new RoomHandler(room)).execute());
}

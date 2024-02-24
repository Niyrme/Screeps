import "Prototype";
import "EventBus";
import "Lib";

import "Creep";
import "Room";
import "RoomPosition";
import "StructureSpawn";
import { creepManager, EVENT_CREEP_DIED } from "Creep";
import { roomManager } from "Room";

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			global.EventBus.trigger(EVENT_CREEP_DIED, {
				name,
				memory: Memory.creeps[name],
			} as IEventBus.Creep.Died.EventBody);
			delete Memory.creeps[name];
		} else {
			creepManager(Game.creeps[name]);
		}
	}

	_.forEach(Game.rooms, roomManager);
}

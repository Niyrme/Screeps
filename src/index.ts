import "Global";
import "Lib";

import "Creep";
import "Room";
import "RoomPosition";
import "StructureSpawn";
import { creepManager } from "Creep";
import { EVENT_CREEP_DIED, EVENT_CREEP_SPAWNED } from "Events";
import { roomManager } from "Room";
import { Logging } from "Utils";

void function init() {
	Logging.info("initializing");
	_.forEach(Game.rooms, roomManager.placeConstructionSites);
	Logging.info("done");
}();

void function setupLogging() {
	global.EventBus.subscribe(EVENT_CREEP_SPAWNED, ({ name }) => Logging.info(`new creep: ${name}`));
	global.EventBus.subscribe(EVENT_CREEP_DIED, ({ name }) => Logging.info(`creep died: ${name}`));
};

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			global.EventBus.trigger(EVENT_CREEP_DIED, {
				name,
				memory: Memory.creeps[name],
			});
			delete Memory.creeps[name];
		} else {
			creepManager(Game.creeps[name]);
		}
	}

	_.forEach(Game.rooms, roomManager);
}

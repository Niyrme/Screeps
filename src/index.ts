import "Global";
import "Lib";

import "Prototypes";
import { EVENT_CREEP_DIED } from "Events";

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			global.EventBus.trigger(EVENT_CREEP_DIED, {
				name,
				memory: Memory.creeps[name],
			});
			delete Memory.creeps[name];
		}
	}

	// _.forEach(Game.rooms, handleRoom);
	// _.forEach(Game.creeps, handleCreep);
}

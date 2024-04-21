import "./Global/_index.ts";
import "./Lib/_index.ts";
import "./Prototypes/_index.ts";
import { handleCreep, handleRoom } from "./Handlers/_index.ts";
import { profiler } from "./Lib/_index.ts";

profiler.enable();

export function loop() {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			Creep.actions.delete(Game.creeps[name].id);

			delete Memory.creeps[name];
		}
	}

	_.forEach(Game.rooms, handleRoom);
	_.forEach(Game.creeps, handleCreep);
}

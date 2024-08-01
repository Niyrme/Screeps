import "./Global";
import "./Lib";
import "./Prototypes";

import profiler from "screeps-profiler";

profiler.enable();

export const loop = profiler.wrap(
	function () {
		for (const name in Memory.creeps) {
			if (!(name in Game.creeps)) {
				delete Memory.creeps[name];
			}
		}
	},
);

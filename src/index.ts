import "./Global";

import profiler from "screeps-profiler";
import { ErrorMapper } from "./Utils";
import type { LoopFuncion } from "./Utils/ErrorMapper";

if (Memory.profiler) {
	profiler.enable();
}

function _loop() {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
}

export const loop = ErrorMapper(Memory.profiler ? (profiler.wrap(_loop) as LoopFuncion) : _loop);

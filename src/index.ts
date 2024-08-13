import "./Global";
import "./Lib";
import "./Prototypes";
import profiler from "screeps-profiler";
import { runHarvest, runUpgrade } from "./Creep/Roles";
import ErrorMapper, { type LoopFuncion } from "./Utils/ErrorMapper.ts";

void function setupMemory() {
	type Defaults = {
		[Key in keyof Omit<Memory, "creeps" | "powerCreeps" | "rooms" | "flags" | "spawns">]?: Memory[Key]
	}
	const defaults: Defaults = {
		profiler: false,
		debug: false,
	};
	Object.entries(defaults).forEach(function ([key, defaultValue]) {
		if (!(key in Memory)) {
			// @ts-ignore
			Memory[key] = defaultValue;
		}
	});
}();

if (Memory.profiler) {
	profiler.enable();
}

function _loop() {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}

	_.forEach(Game.creeps, function (creep) {
		runHarvest(creep);
		runUpgrade(creep);
	});
}

export const loop = ErrorMapper(Memory.profiler ? (profiler.wrap(_loop) as LoopFuncion) : _loop);

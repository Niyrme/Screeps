import { CodeToString } from "../util/errors.ts";
import Logging from "../util/logging.ts";

declare global {
	interface StructureSpawn {
		_spawnCreep(body: Array<BodyPartConstant>, name: string, opts?: SpawnOptions): ScreepsReturnCode;

		spawnCreep(body: Array<BodyPartConstant>, opts: PartialRequired<SpawnOptions, "memory">): ScreepsReturnCode;
	}
}

(() => {
	StructureSpawn.prototype.toString = function () {
		return `Spawn(${this.room.name}, ${this.name})`;
	};

	if (!StructureSpawn.prototype._spawnCreep) {
		StructureSpawn.prototype._spawnCreep = StructureSpawn.prototype.spawnCreep;

		// @ts-ignore
		StructureSpawn.prototype.spawnCreep = function (body, opts: PartialRequired<SpawnOptions, "memory">) {
			const err = this._spawnCreep(body, Memory.creepID.toString(), opts);
			Logging.debug(`Spawn Creep(${Memory.creepID}); body=${JSON.stringify(body)}; code=${CodeToString(err)}`);
			if (err === OK) {
				Logging.info(`New creep Creep(${Memory.creepID}, ${opts.memory.role})`);
				Memory.creepID++;
			}
			return err;
		};
	}
})();


export {};

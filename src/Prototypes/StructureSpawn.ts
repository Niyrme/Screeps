import { Logging } from "Utils";

declare global {
	namespace StructureSpawn {
		export type SpawnCreepReturnType =
			| OK
			| ERR_NOT_OWNER
			| ERR_NAME_EXISTS
			| ERR_BUSY
			| ERR_NOT_ENOUGH_RESOURCES
			| ERR_INVALID_ARGS
			| ERR_RCL_NOT_ENOUGH
	}

	interface StructureSpawn {
		spawnCreep(body: Array<BodyPartConstant>, name: string, opts?: SpawnOptions): StructureSpawn.SpawnCreepReturnType;

		newCreep(body: Array<BodyPartConstant>, opts: PartialRequired<SpawnOptions, "memory">): StructureSpawn.SpawnCreepReturnType;
	}
}

StructureSpawn.prototype.newCreep = function (body, opts) {
	const name = `${Game.time.toString(36)}|${Memory.creepID.toString(36)}`;

	const err = this.spawnCreep(body, name, opts);
	if (err === OK) {
		Logging.info(`New creep: ${name}`);
		Memory.creepID++;
	}
	return err;
};

export {};

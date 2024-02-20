import { Logging } from "Util";

declare global {
	export namespace StructureSpawn {
		export type SpawnCreepReturnType =
			OK
			| ERR_NOT_OWNER
			| ERR_NAME_EXISTS
			| ERR_BUSY
			| ERR_NOT_ENOUGH_RESOURCES
			| ERR_INVALID_ARGS
			| ERR_RCL_NOT_ENOUGH
	}

	interface StructureSpawn {
		newCreep(body: Array<BodyPartConstant>, opts: PartialRequired<SpawnOptions, "memory">): StructureSpawn.SpawnCreepReturnType;
	}
}

StructureSpawn.prototype.newCreep = function (body, opts) {
	const timeStamp = Game.time.toString(36);
	const creepID = Memory.creepID.toString(36);
	const name = `${timeStamp}/${creepID}`;

	const err = this.spawnCreep(body, name, {
		directions: [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT],
		...opts,
	}) as StructureSpawn.SpawnCreepReturnType;

	if (err === OK) {
		Logging.info(`new Creep ${name}`);
		Memory.creepID++;
	}

	return err;
};

export {};

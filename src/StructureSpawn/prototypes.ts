import { EVENT_CREEP_SPAWNED } from "Creep";
import { Logging } from "Utils";

declare global {
	export namespace StructureSpawn {
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
		newCreep(
			body: Array<BodyPartConstant>,
			opts: PartialRequired<SpawnOptions, "memory">,
			encodeMemory: Omit<CreepName, "spawnTime">,
		): StructureSpawn.SpawnCreepReturnType;

		newGenericCreep(
			base: Array<BodyPartConstant>,
			opts: PartialRequired<SpawnOptions, "memory">,
			encodeMemory: Omit<CreepName, "spawnTime">,
		): StructureSpawn.SpawnCreepReturnType;
	}
}

StructureSpawn.prototype.newCreep = function (body, opts, encodeMemory) {
	const name = Creep.encodeName({ ...encodeMemory, spawnTime: Game.time });

	const err = this.spawnCreep(body, name, {
		directions: [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT],
		...opts,
	}) as StructureSpawn.SpawnCreepReturnType;

	if (err === OK) {
		global.EventBus.trigger(EVENT_CREEP_SPAWNED, {
			name,
			spawn: this.id,
		} as IEventBus.Creep.Spawned.EventBody);
		Logging.info(`new Creep ${name}`);
	}

	return err;
};

StructureSpawn.prototype.newGenericCreep = function (base, opts, encodeMemory) {
	const size = Math.clamp(
		Math.floor(this.room.energyCapacityAvailable / Creep.getBodyCost(base)),
		1,
		this.room.controller!.level + 1,
	);

	return this.newCreep(_.flatten(_.fill(new Array(size), base)), opts, encodeMemory);
};

export {};

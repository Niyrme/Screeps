import { EVENT_CREEP_SPAWNED } from "Events";

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
		spawnCreep(body: Array<BodyPartConstant>, name: string, opts?: SpawnOptions): StructureSpawn.SpawnCreepReturnType;
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
	});

	if (err === OK) {
		global.EventBus.trigger(EVENT_CREEP_SPAWNED, {
			name,
			spawn: this,
		});
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

import type { EncodeMemory } from "../Creep/prototypes.ts";

declare global {
	export namespace StructureSpawn {
		export type SpawnCreepReturnType = OK | ERR_NOT_OWNER | ERR_NAME_EXISTS | ERR_BUSY | ERR_NOT_ENOUGH_RESOURCES | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH
	}

	interface StructureSpawn {
		newCreep(body: Array<BodyPartConstant>, opts: PartialRequired<SpawnOptions, "memory">, encodeMemory: EncodeMemory): StructureSpawn.SpawnCreepReturnType;
	}
}

StructureSpawn.prototype.newCreep = function (body, opts, encodeMemory) {
	const timeStamp = Game.time.toString(36);
	const encodedMemory = Creep.encodeMemory(encodeMemory);

	return this.spawnCreep(
		body,
		`${timeStamp}|${encodedMemory}`,
		{
			directions: [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT],
			...opts,
		},
	) as StructureSpawn.SpawnCreepReturnType;
};

export {};

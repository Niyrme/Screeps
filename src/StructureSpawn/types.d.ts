export {};

declare global {
	interface StructureSpawn {
		newCreep(body: Array<BodyPartConstant>, opts: PartialRequired<SpawnOptions, "memory">): ScreepsReturnCode;

		spawnMaxCreep(baseBody: Array<BodyPartConstant>, opts: PartialRequired<SpawnOptions, "memory">): ScreepsReturnCode;
	}
}

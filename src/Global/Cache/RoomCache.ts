import Cache, { type CacheValue } from "./_base.ts";

interface IRoomCache extends CacheValue {
	readonly sources: Array<Source>;
	readonly minerals: Array<Mineral>;

	readonly structures: Array<AnyStructure>;
	readonly spawns: Array<StructureSpawn>;
	readonly towers: Array<StructureTower>;
}

class RoomCache extends Cache<Room["name"], IRoomCache> {
	protected evalCache(roomName: Room["name"]): IRoomCache {
		const room = Game.rooms[roomName];
		if (!room) {
			throw new Error(`Cannot access room ${roomName}`);
		}

		const structures = room.find(FIND_STRUCTURES, {
			filter: s => "my" in s ? s.my : true,
		});

		return {
			lastUpdated: Game.time,
			sources: room.find(FIND_SOURCES),
			minerals: room.find(FIND_MINERALS),
			structures,
			spawns: structures.filter((s): s is Extract<typeof s, StructureSpawn> => s.structureType === STRUCTURE_SPAWN),
			towers: structures.filter((s): s is Extract<typeof s, StructureTower> => s.structureType === STRUCTURE_TOWER),
		};
	}
}

export default new RoomCache();

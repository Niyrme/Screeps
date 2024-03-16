import CreepCache from "./CreepCache.ts";
import RoomCache from "./RoomCache.ts";

interface Cache {
	Creep: typeof CreepCache;
	Room: typeof RoomCache;
}

declare global {
	interface Global {
		Cache: Cache;
	}
}

global.Cache = {
	Creep: CreepCache,
	Room: RoomCache,
};

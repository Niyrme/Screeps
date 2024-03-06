import CreepCache from "./Creep.ts";
import RoomCache from "./Room.ts";

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

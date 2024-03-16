import Cache, { type CacheValue } from "./_base.ts";

interface ICreepCache extends CacheValue {
}

class CreepCache extends Cache<Creep["name"], ICreepCache> {
	protected evalCache(): ICreepCache {
		return {
			lastUpdated: Game.time,
		};
	}
}

export default new CreepCache();

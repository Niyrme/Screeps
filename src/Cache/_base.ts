export interface CacheValue {
	readonly lastUpdated: typeof Game.time;
}

export default abstract class Cache<K, V extends CacheValue> extends Map<K, V> {
	// @ts-ignore
	get(key: K): Omit<V, "lastUpdated"> {
		if ((!this.has(key)) || super.get(key)!.lastUpdated !== Game.time) {
			this.set(key, this.evalCache(key));
		}

		const v = super.get(key)!;

		// @ts-ignore
		delete v["lastUpdated"];
		return v as Omit<V, "lastUpdated">;
	}

	protected set(key: K, value: V): typeof this {
		return super.set(key, value);
	}

	protected abstract evalCache(key: K): V
}

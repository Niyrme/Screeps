declare global {
	interface Global extends Record<string, any> {}

	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>

	const global: Global;
}

declare global {
	interface TickCache {
		readonly lastUpdated: typeof Game.time;
	}
}

declare global {
	interface Memory {
		readonly roleMap: Record<number, keyof AllRoles>;
		debug: boolean;
	}

	type CustomMemory = Omit<Memory, "creeps" | "flags" | "powerCreeps" | "rooms" | "spawns">

	interface BaseCreep<M extends Record<any, any> = {}> extends Creep {
		memory: CreepMemory & M;
	}
}

export {};

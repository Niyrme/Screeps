declare global {
	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>
}

declare global {
	interface Memory {
		readonly roleMap: Record<number, string>;
		debug: boolean;
		creepID: number;
		colonyID: number;
	}

	type CustomMemory = Omit<Memory, "creeps" | "flags" | "powerCreeps" | "rooms" | "spawns">

	type BaseCreep = Creep
}

export {};

interface Global extends Record<string, any> {
	EventBus: IEventBus;
}

declare global {
	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>

	const global: Global;
}

declare global {
	interface Memory {
		creepID: number;
		debug: boolean;
	}

	type CustomMemory = Omit<Memory, "creeps"|"flags"|"powerCreeps"|"rooms"|"spawns">
}

export {};

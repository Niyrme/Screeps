declare global {
	interface ObjectConstructor {
		keys<K extends keyof any>(o: Record<K, unknown>): Array<K>;
	}

	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>
}

declare global {
	interface CustomMemory {
		debug: boolean;
	}

	interface Memory extends CustomMemory {
		readonly roleMap: Record<number, string>;
	}

	type BaseCreep = Creep
}

export {};

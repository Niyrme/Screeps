declare global {
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

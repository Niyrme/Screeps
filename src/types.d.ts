declare global {
	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>
}

declare global {
	interface CustomMemory {
		debug: boolean;
		creepID: number;
		jobID: number;
	}

	interface Memory extends CustomMemory {
	}

	type BaseCreep = Creep
}

export {};

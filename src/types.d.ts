declare global {
	interface ObjectConstructor {
		keys<K extends keyof any>(o: Record<K, unknown>): Array<K>;
	}
}

declare global {
	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>

	type ScreepsErrorCode = Exclude<ScreepsReturnCode, OK>

	interface HasStore {
		store: Store<ResourceConstant, false>;
	}

	interface CustomMemory {
		debug: boolean;
		creepID: number;
		visuals: boolean;
	}

	// global memory
	interface Memory extends CustomMemory {
	}
}

export {};

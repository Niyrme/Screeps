declare global {
	interface ObjectConstructor {
		keys<K extends keyof any>(o: Record<K, unknown>): Array<K>;
	}
}

declare global {
	interface CustomMemory {
		debug: boolean;
	}

	interface Memory extends CustomMemory {
	}
}

export {};

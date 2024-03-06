declare global {
	interface ObjectConstructor {
		keys<R extends Record<any, unknown>>(o: R): Array<keyof R>;

		keys<O extends { [K in any]: unknown }>(o: O): Array<keyof O>;
	}
}

export {};

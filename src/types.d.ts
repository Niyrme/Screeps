declare global {
	interface Global extends Record<any, any> {}

	const global: Global;

	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>
}

declare global {
	interface Memory {
		debug: boolean;
		creepID: number;
	}
}

export {};

declare global {
	interface Global extends Record<string, any> {}

	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>

	const global: Global;
}

export {};

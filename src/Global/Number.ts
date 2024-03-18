declare global {
	type NonZero<T extends number> =
		number extends T
			? never
			: (T extends 0 ? never : T)

	type NonNegative<T extends number> =
		number extends T
			? never
			: (`${T}` extends `-${string}` ? never : T)
}

export {};

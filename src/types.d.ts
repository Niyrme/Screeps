import type { LoDashStatic } from "lodash";

declare global {
	const _: LoDashStatic;

	type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>
}

declare global {
	interface Memory {
		debug: boolean;
	}
}

export {};

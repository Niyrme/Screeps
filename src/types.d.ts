import type { LoDashStatic } from "lodash";

declare global {
	const _: LoDashStatic;
}

declare global {
	interface Memory {
		debug: boolean;
		profiler?: boolean;
	}
}

export {};

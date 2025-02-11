import type { LoDashStatic } from "lodash";

declare global {
	// @ts-expect-error lodash is available globally in screeps
	const _: LoDashStatic;
}

declare global {
	interface Memory {
		debug: boolean;
		profiler?: boolean;
	}
}

export { };

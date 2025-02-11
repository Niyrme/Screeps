export class AssertionError extends Error {
	constructor(message?: string) {
		const msg = message ? `: ${message}` : "";
		super(`AssertionError${msg}`);
	}
}

export default function assert(value: unknown, message?: string): asserts value {
	if (!!value) {
		return;
	} else {
		throw new AssertionError(message);
	}
}

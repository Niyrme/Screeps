declare global {
	interface Math {
		clamp(value: number, min: number, max: number): number;
	}
}

if (!Math.clamp) {
	Math.clamp = function (value, min, max) {
		return Math.min(Math.max(min, value), max);
	};
}

export {};

declare global {
	interface Math {
		clamp(value: number, min: number, max: number): number;
	}
}

Math.clamp = function (value, min, max) {
	return this.min(this.max(min, value), max);
};

export { };

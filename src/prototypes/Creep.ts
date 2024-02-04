declare global {
	interface Creep {
		formatContext(): string;
	}
}

(() => {
	Creep.prototype.formatContext = function () {
		return `Creep(${this.name}, ${this.memory.role})`;
	};
})();

// required if we don't import/export anything else so that TS knows it's a module
export {};

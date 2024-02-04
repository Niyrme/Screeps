declare global {
	interface Creep {
		whisper(text: string): ReturnType<Creep["say"]>;
	}
}

(() => {
	Creep.prototype.whisper = function (text) {
		return this.say(text, false);
	};
})();

// required if we don't import/export anything else so that TS knows it's a module
export {};

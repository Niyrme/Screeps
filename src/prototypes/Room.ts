declare global {
	interface Room {
		queueConstructionSites(): void;

		queueRepairs(): void;
	}
}

(() => {
	Room.prototype.queueConstructionSites = function () {
	};

	Room.prototype.queueRepairs = function () {
	};
})();

export {};

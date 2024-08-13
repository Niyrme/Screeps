export const findSource = function () {
	const sources = new WeakMap<Room, Array<Source>>(
		_.map(Game.rooms, room => [room, room.find(FIND_SOURCES)]),
	);

	return function (creep: Creep) {
		if (!sources.has(creep.room)) {
			sources.set(creep.room, creep.room.find(FIND_SOURCES));
		}

		return creep.pos.findClosestByPath(sources.get(creep.room)!);
	};
}();

import roomConstruction from "./construction.ts";
import roomDefense from "./defense.ts";
import roomSpawning from "./spawning.ts";

(function initialSetup() {
	_.forEach(Game.rooms, room => {
		room.memory.attackEnemy = null;
		room.populateMemoryResources();
		roomConstruction(room);
	});
})();

export function manageRoom(room: Room) {
	roomDefense(room);
	if (Game.time % 500 === 0) {
		roomConstruction(room);
	}
	roomSpawning(room);
}

export default manageRoom;

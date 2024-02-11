import roomConstruction from "./construction.ts";
import roomDefense from "./defense.ts";
import roomSpawning from "./spawning.ts";

(function populateRoomMemory() {
	_.forEach(Game.rooms, (room) => {
		room.memory.attackEnemy = null;
		room.populateMemoryResources();
	});
})();

export function manageRoom(room: Room) {
	roomDefense(room);
	roomConstruction(room);
	roomSpawning(room);
}

export default manageRoom;

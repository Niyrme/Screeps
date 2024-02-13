import "lib";
import "RoomPosition";
import { manageCreep } from "Creep";
import { manageRoom } from "Room";

export function loop(): void {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}

	_.forEach(Game.rooms, manageRoom);
	_.forEach(Game.creeps, manageCreep);
}

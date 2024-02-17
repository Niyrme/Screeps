import { bunkers } from "templates";
import { Logging } from "util";

export function roomConstruction(room: Room) {
	if (!room.controller?.my) {
		return;
	}

	const baseFlag = Game.flags[room.name];
	if (!baseFlag) {
		Logging.error(`${room} missing base flag`);
		return;
	}

	const spawnCount = room.find(FIND_MY_SPAWNS).length;

	for (const stage of bunkers.bunkerRound.stages) {
		if (stage.rcl === room.controller.level) {
			for (const structureType of Object.keys(stage.buildings)) {
				for (const { x, y } of stage.buildings[structureType]) {
					const pos = room.getPositionAt(x, y);
					if (structureType === STRUCTURE_SPAWN) {
						pos?.tryPutConstructionSite(structureType, `${room.name} - ${spawnCount + 1}`);
					} else {
						pos?.tryPutConstructionSite(structureType);
					}
				}
			}
		}
	}
}

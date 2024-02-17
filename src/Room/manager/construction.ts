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

	for (const stage of bunkers.bunkerRound.stages) {
		if (stage.rcl === room.controller.level) {
			for (const structureType of Object.keys(stage.buildings)) {
				for (const { x, y } of stage.buildings[structureType]) {
					const pos = room.getPositionAt(
						baseFlag.pos.x - bunkers.bunkerRound.cx + x,
						baseFlag.pos.y - bunkers.bunkerRound.cy + y,
					);
					if (structureType === STRUCTURE_SPAWN) {
						pos?.tryPutConstructionSite(structureType, `${room.name}-${room.find(FIND_MY_SPAWNS).length + 1}`);
					} else {
						pos?.tryPutConstructionSite(structureType);
					}
				}
			}
		}
	}
}

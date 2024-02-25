import { Bunkers } from "Templates";
import { Logging } from "Utils";

export function roomHandlerConstruction(room: Room) {
	if (!room.controller?.my) {
		return;
	}

	const baseFlag = Game.flags[room.name];
	if (!baseFlag) {
		Logging.error(`${room} missing base flag`);
		return;
	}

	for (const stage of Bunkers.Round.stages) {
		if (stage.rcl === room.controller.level) {
			for (const structureType of Object.keys(stage.buildings)) {
				for (const { x, y } of stage.buildings[structureType]) {
					const pos = room.getPositionAt(
						baseFlag.pos.x - Bunkers.Round.cx + x,
						baseFlag.pos.y - Bunkers.Round.cy + y,
					);

					if (structureType === STRUCTURE_SPAWN) {
						pos?.tryCreateConstructionSite(
							structureType,
							`${room.name}-${room.find(FIND_MY_SPAWNS).length + 1}`,
						);
					} else {
						pos?.tryCreateConstructionSite(structureType);
					}
				}
			}
		}
	}

	if (CONTROLLER_STRUCTURES[STRUCTURE_EXTRACTOR][room.controller.level] !== 0) {
		room.find(FIND_MINERALS).forEach(mineral => {
			mineral.pos.tryCreateConstructionSite(STRUCTURE_EXTRACTOR);
		});
	}
}

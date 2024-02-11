import { UnhandledError } from "../../util/errors.ts";

export function roomConstruction(room: Room) {
	for (const sourceId of Object.keys(room.memory.resources.energy)) {
		const source = Game.getObjectById(sourceId)!;
		const hasContainer =
			source.pos.findInRange(FIND_STRUCTURES, 1, {
				filter: s => s.structureType === STRUCTURE_CONTAINER,
			}).length !== 0
			|| source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
				filter: s => s.structureType === STRUCTURE_CONTAINER,
			}).length !== 0;

		if (!hasContainer) {
			const sourcePos = room.storage || room.find(FIND_MY_SPAWNS).pop();
			if (sourcePos) {
				const containerPos = room.findPath(source.pos, sourcePos.pos, {
					ignoreCreeps: true,
					ignoreRoads: false,
				})[0];

				const err = room.createConstructionSite(
					room.getPositionAt(containerPos.x, containerPos.y)!,
					STRUCTURE_CONTAINER,
				);

				switch (err) {
					case OK:
						break;
					default:
						throw new UnhandledError(err);
				}
			}
		}
	}
}

export default roomConstruction;

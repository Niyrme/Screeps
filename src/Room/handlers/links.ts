import { Logging } from "Utils";

export function roomHandlerLinks(room: Room) {
	if (!room.controller?.my) { return; }
	if (CONTROLLER_STRUCTURES[STRUCTURE_LINK][room.controller.level] === 0) { return; }

	const flag = Game.flags[room.name];

	const links = room.find(FIND_MY_STRUCTURES, {
		filter: s => s.structureType === STRUCTURE_LINK,
	}) as Array<StructureLink>;

	const [baseLink] = flag.pos.findInRange(links, 1);
	if (!baseLink) {
		Logging.warning(`${room} base link is missing`);
		return;
	} else if (baseLink.store.getUsedCapacity(RESOURCE_ENERGY) !== 0) {
		return;
	}
	const otherLinks = links.filter(l => l.id !== baseLink.id);

	for (const link of otherLinks) {
		if (link.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			if (link.transferEnergy(baseLink) === OK) { return; }
		}
	}
}

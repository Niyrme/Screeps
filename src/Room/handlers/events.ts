import { EVENT_ROOM_ATTACKED, EVENT_ROOM_RCL_CHANGE } from "Events";

export function roomHandlerEvents(room: Room) {
	if (room.controller?.my) {
		const seenEvents = new Set<EventConstant>();
		for (const { event, objectId } of room.getEventLog()) {
			if (seenEvents.has(event)) { continue; }
			seenEvents.add(event);

			switch (event) {
				case EVENT_UPGRADE_CONTROLLER: {
					if (room.controller.level !== room.memory.RCL) {
						global.EventBus.trigger(EVENT_ROOM_RCL_CHANGE, {
							room,
							oldLevel: room.memory.RCL,
							newLevel: room.controller.level,
						});
						room.memory.RCL = room.controller.level;
					}
					break;
				}
				case EVENT_ATTACK: {
					const attacker = Game.getObjectById(objectId as Id<Creep | PowerCreep | StructureTower>)!;
					if (attacker.my) { break; }
					global.EventBus.trigger(EVENT_ROOM_ATTACKED, {
						room,
						attacker,
					});
					break;
				}
			}
		}
	}
}

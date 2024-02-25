import { EVENT_ROOM_ATTACKED, EVENT_ROOM_RCL_CHANGE } from "Room";

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
							room: room.name,
							old: room.memory.RCL,
							new: room.controller.level,
						} as IEventBus.Room.RCLChange.EventBody);
						room.memory.RCL = room.controller.level;
					}
					break;
				}
				case EVENT_ATTACK: {
					global.EventBus.trigger(EVENT_ROOM_ATTACKED, {
						room: room.name,
						creep: objectId,
					} as IEventBus.Room.Attacked.EventBody);
					break;
				}
			}
		}
	}
}

import { EVENT_ROOM_ATTACKED } from "Events";

function triggerEvents(room: Room) {
	for (const event of room.getEventLog()) {
		switch (event.event) {
			case EVENT_ATTACK: {
				const attacker = Game.getObjectById(event.objectId as Id<Creep | PowerCreep | StructureTower>)!;
				if ("my" in attacker && !attacker.my) {
					global.EventBus.trigger(EVENT_ROOM_ATTACKED, {
						room,
						attacker,
					});
				}
				break;
			}
		}
	}
}

export function handleRoom(room: Room) {
	triggerEvents(room);
}

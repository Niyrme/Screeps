import "./prototypes.ts";
import { Bunkers } from "Templates";
import { Logging } from "Utils";
import { EVENT_ROOM_ATTACKED, EVENT_ROOM_RCL_CHANGE } from "./events.ts";

export * from "./events.ts";

export function roomManager(room: Room) {
	if (!room.memory.attackTargets) {
		room.memory.attackTargets = [];
	}

	roomManager.triggerEvents(room);
	roomManager.towers(room);
}

export namespace roomManager {
	export function triggerEvents(room: Room) {
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

	const getTowers = (room: Room): Array<StructureTower> => room.find(FIND_MY_STRUCTURES, {
		filter: s => s.structureType === STRUCTURE_TOWER,
	});

	function towersDefend(room: Room): boolean {
		if (room.memory.attackTargets.length !== 0) {
			let idx = 0;
			for (; idx < room.memory.attackTargets.length; idx++) {
				const creep = Game.getObjectById(room.memory.attackTargets[idx]);
				if (creep?.pos.roomName === room.name) {
					break;
				}
			}

			if (idx !== 0) {
				room.memory.attackTargets.splice(0, idx);
			}

			if (room.memory.attackTargets.length === 0) { return false; }

			const creep = Game.getObjectById(room.memory.attackTargets[0])!;

			getTowers(room).forEach(tower => tower.attack(creep));
			return true;
		} else {
			return false;
		}
	}

	function towersHeal(room: Room): boolean {
		const creeps = room.find(FIND_MY_CREEPS, {
			filter: c => c.hits < c.hitsMax,
		});

		let creep: Creep;
		if (creeps.length === 0) {
			return false;
		} else if (creeps.length === 1) {
			[creep] = creeps;
		} else {
			creep = creeps.reduce((weakest, current) => current.hits < weakest.hits ? current : weakest);
		}

		getTowers(room).forEach(tower => tower.heal(creep));
		return true;
	}

	function towersRepair(room: Room): boolean {
		return false;
	}

	export function towers(room: Room) {
		towersDefend(room)
		|| towersHeal(room)
		|| towersRepair(room);
	}
}

global.EventBus.subscribe(EVENT_ROOM_ATTACKED, ({ room: roomName, creep: creepID }) => {
	const room = Game.rooms[roomName];
	if (!room.controller?.my) { return; }

	if (!_.contains(room.memory.attackTargets, creepID)) {
		room.memory.attackTargets.push(creepID);
	}
});

global.EventBus.subscribe(EVENT_ROOM_RCL_CHANGE, ({ room: roomName, old, new: newLevel }) => {
	const room = Game.rooms[roomName];

	if (!room.controller?.my) { return; }

	if (newLevel > old) {
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
	}
});

import "./prototypes.ts";
import { EVENT_ROOM_ATTACKED, EVENT_ROOM_RCL_CHANGE } from "./events.ts";

export * from "./events.ts";

export class RoomHandler {
	protected readonly memory: RoomMemory;

	constructor(protected room: Room) {
		this.memory = room.memory;
	}

	public execute() {
		this.triggerEvents();

		this.defense()
		|| this.heal()
		|| this.repair();
	}

	private triggerEvents() {
		if (this.room.controller?.my) {
			const seenEvents = new Set<EventConstant>();
			for (const { event, objectId } of this.room.getEventLog()) {
				if (seenEvents.has(event)) { continue; }
				seenEvents.add(event);

				switch (event) {
					case EVENT_UPGRADE_CONTROLLER: {
						if (this.room.controller.level !== this.memory.RCL) {
							global.EventBus.trigger(EVENT_ROOM_RCL_CHANGE, this.room.name, {
								old: this.memory.RCL,
								new: this.room.controller.level,
							} as IEventBus.Room.RCLChange.EventBody);
							this.memory.RCL = this.room.controller.level;
						}
						break;
					}
					case EVENT_ATTACK: {
						global.EventBus.trigger(EVENT_ROOM_ATTACKED, this.room.name, {
							creep: objectId,
						} as IEventBus.Room.Attacked.EventBody);
						break;
					}
				}
			}
		}
	}

	private getTowers(): Array<StructureTower> {
		return this.room.find(FIND_MY_STRUCTURES, {
			filter: s => s.structureType === STRUCTURE_TOWER,
		});
	}

	private defense(): boolean {
		if (this.memory.attackTargets.length !== 0) {
			let idx = 0;
			for (; idx < this.memory.attackTargets.length; idx++) {
				const creep = Game.getObjectById(this.memory.attackTargets[idx]);
				if (creep?.pos.roomName === this.room.name) {
					break;
				}
			}
			if (idx !== 0) {
				this.memory.attackTargets.splice(0, idx);
			}

			if (this.memory.attackTargets.length === 0) { return false; }

			const creep = Game.getObjectById(this.memory.attackTargets[0])!;

			this.getTowers().forEach(tower => tower.attack(creep));
			return true;
		} else {
			return false;
		}
	}

	private heal(): boolean {
		const creeps = this.room.find(FIND_MY_CREEPS, {
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

		this.getTowers().forEach(tower => tower.heal(creep));
		return true;
	}

	private repair(): boolean {
		return false;
	}
}

global.EventBus.subscribe(EVENT_ROOM_ATTACKED, (roomName, { creep: creepID }) => {
	const room = Game.rooms[roomName];
	if (!room.controller?.my) { return; }

	if (!_.contains(room.memory.attackTargets, creepID)) {
		room.memory.attackTargets.push(creepID);
	}
});

global.EventBus.subscribe(EVENT_ROOM_RCL_CHANGE, (roomName, { old, new: newLevel }) => {
	if (newLevel > old) {
		// TODO place construction sites
	}
});

import { UnhandledError, UnreachableError } from "../../util/errors.ts";

declare global {
	namespace Roles {
		export namespace Upgrade {
			export interface memory extends CreepMemory {
				state: "gather" | "upgrade";
			}

			export interface creep extends Creep {
				memory: Roles.Upgrade.memory;
			}
		}

		export interface Upgrade extends Roles.CreepRole<Roles.Upgrade.creep> {
			spawn(spawn: StructureSpawn): ScreepsReturnCode;
		}
	}
}

export const roleUpgrade: Roles.Upgrade = {
	spawn(spawn) {
		return spawn.spawnMaxCreep([WORK, CARRY, MOVE], {
			memory: {
				role: "upgrade",
				homeRoom: spawn.room.name,
				state: "gather",
			} as Roles.Upgrade.memory,
		});
	},
	run(creep) {
		if (creep.memory.state === "gather" && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "upgrade";
		} else if (creep.memory.state === "upgrade" && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.state = "gather";
		}

		if (creep.memory.state === "gather") {
			creep.collectEnergy();
		} else if (creep.memory.state === "upgrade") {
			const controller = Game.rooms[creep.memory.homeRoom].controller;
			if (controller) {
				const err = creep.upgradeController(controller);
				switch (err) {
					case OK:
					case ERR_BUSY:
						break;
					case ERR_NOT_IN_RANGE:
						creep.moveTo(controller);
						break;
					default:
						throw new UnhandledError(err);
				}
			} else {
				throw new UnreachableError(`${creep} home room has no controller`);
			}
		} else {
			throw new UnreachableError(`${creep}.memory.state = ${creep.memory.state}`);
		}
	},
};

export default roleUpgrade;

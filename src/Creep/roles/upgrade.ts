import { Logging, registerRole } from "util";
import { getBodyCost } from "../util.ts";

declare global {
	export namespace Roles {
		export namespace Upgrade {
			export interface Memory extends CreepMemory {
				gather: boolean;
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}

			export interface Role extends Roles.Role<Creep> {
				spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType;
			}
		}
	}
}

export const ROLE_UPGRADE = "upgrade";
registerRole(ROLE_UPGRADE);

const UPGRADE_CONTROLLER_RANGE = 3;

export const roleUpgrade: Roles.Upgrade.Role = {
	spawn(spawn) {
		const memory: Roles.Upgrade.Memory = {
			home: spawn.room.name,
			recycleSelf: false,
			gather: true,
		};

		const baseBody: Array<BodyPartConstant> = [WORK, CARRY, MOVE];
		const size = Math.max(1, Math.floor(
			spawn.room.energyAvailable / getBodyCost(baseBody),
		));

		const body = _.flatten(_.fill(new Array(size), baseBody));

		return spawn.newCreep(
			body,
			{ memory },
			{
				role: ROLE_UPGRADE,
			},
		);
	},
	run(creep) {
		if (creep.memory.gather && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = false;
		} else if ((!creep.memory.gather) && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = true;
		}

		if (creep.memory.gather) {
			return creep.gatherEnergy();
		} else {
			if (!creep.room.controller?.my) {
				Logging.error(`${creep} could not find controller`);
				return ERR_NOT_FOUND;
			}

			let err = creep.upgradeController(creep.room.controller);
			if (err === ERR_NOT_IN_RANGE) {
				creep.travelTo(creep.room.controller, { range: UPGRADE_CONTROLLER_RANGE });
				err = creep.upgradeController(creep.room.controller);
			}
			return err;
		}
	},
};

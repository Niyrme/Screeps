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
	run(this) {
		if (this.memory.gather && this.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			this.memory.gather = false;
		} else if ((!this.memory.gather) && this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			this.memory.gather = true;
		}

		if (this.memory.gather) {
			const resource = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
				filter: r => r.resourceType === RESOURCE_ENERGY && r.amount >= this.store.getFreeCapacity(RESOURCE_ENERGY),
			});
			if (resource) {
				const err = this.pickup(resource);

				if (err === ERR_NOT_IN_RANGE) {
					this.travelTo(resource);
					this.pickup(resource);
				}

				return err;
			}
		} else {
			if (!this.room.controller?.my) {
				Logging.error(`${this} could not find controller`);
				return ERR_NOT_FOUND;
			}

			const err = this.upgradeController(this.room.controller);

			if (err === ERR_NOT_IN_RANGE) {
				this.travelTo(this.room.controller, { range: UPGRADE_CONTROLLER_RANGE });
				this.upgradeController(this.room.controller);
			}

			return err;
		}

		return ERR_NOT_FOUND;
	},
};

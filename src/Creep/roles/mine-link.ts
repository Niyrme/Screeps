import { Logging, NotImplementedError, registerRole } from "util";
import { getBodyCost } from "../util.ts";

declare global {
	export namespace Roles {
		export namespace MineLink {
			export interface Memory extends CreepMemory {
				readonly source: Id<Source>;
				readonly link: Id<StructureLink>;
				atSource: boolean;
			}

			export interface Creep extends BaseCreep {
				readonly memory: Memory;
			}

			export interface Role extends Roles.Role<Creep> {
				spawn(spawn: StructureSpawn, source: Id<Source>): StructureSpawn.SpawnCreepReturnType;
			}
		}
	}
}

export const ROLE_MINE_LINK = "mineLink";
registerRole(ROLE_MINE_LINK);

export const roleMineLink: Roles.MineLink.Role = {
	spawn(spawn, source) {
		const body: Array<BodyPartConstant> = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE];
		if (getBodyCost(body) > spawn.room.energyCapacityAvailable) {
			return ERR_NOT_ENOUGH_RESOURCES;
		}

		throw new NotImplementedError("roleMineLink.spawn");
	},
	run(creep) {
		const source = Game.getObjectById(creep.memory.source)!;

		if (creep.memory.atSource) {
			return creep.harvest(source);
		} else {
			const link = Game.getObjectById(creep.memory.link)!;
			if (creep.pos.isNearTo(source) && creep.pos.isNearTo(link)) {
				creep.memory.atSource = true;
				return creep.harvest(source);
			}

			if (!creep.pos.isNearTo(source)) {
				creep.travelTo(source);
			} else if (!creep.pos.isNearTo(link)) {
				creep.travelTo(link);
			} else {
				Logging.error(`${creep} is stuck`);
			}
			return ERR_NOT_IN_RANGE;
		}
	},
};

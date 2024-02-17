import { registerRole } from "util";
import { getBodyCost } from "../util.ts";

declare global {
	export namespace Roles {
		export namespace MineDrop {
			export interface Memory extends CreepMemory {
				readonly source: Id<Source>;
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

export const ROLE_MINE_DROP = "mineDrop";
registerRole(ROLE_MINE_DROP);

export const roleMineDrop: Roles.MineDrop.Role = {
	spawn(spawn, source) {
		const memory: Roles.MineDrop.Memory = {
			home: spawn.room.name,
			recycleSelf: false,
			source,
		};
		const body: Array<BodyPartConstant> = [MOVE, WORK, WORK, WORK, WORK, WORK];
		while (getBodyCost(body) > spawn.room.energyCapacityAvailable) {
			body.pop();
		}
		if (body.length < 2) {
			return ERR_NOT_ENOUGH_RESOURCES;
		} else {
			return spawn.newCreep(
				body,
				{ memory },
				{
					role: ROLE_MINE_DROP,
				},
			);
		}
	},
	run(creep) {
		const source = Game.getObjectById(creep.memory.source)!;

		const err = creep.harvest(source);

		if (err === ERR_NOT_IN_RANGE) {
			creep.travelTo(source);
			creep.harvest(source);
		}

		return err;
	},
};

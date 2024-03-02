import { Logging } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleDefend.NAME]: typeof RoleDefend;
	}
}

export namespace RoleDefend {
	export interface Memory {
		target: null | Id<BaseCreep | PowerCreep>;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleDefend extends BaseRole {
	public static readonly NAME: "defend" = "defend";

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		const body = ([] as Array<BodyPartConstant>).concat(
			_.flatten(_.fill(new Array(10), TOUGH)),
			_.flatten(_.fill(new Array(5), MOVE)),
			_.flatten(_.fill(new Array(5), [ATTACK, RANGED_ATTACK])),
			_.flatten(_.fill(new Array(5), MOVE)),
			_.flatten(_.fill(new Array(5), [ATTACK, RANGED_ATTACK])),
		);

		while (Creep.getBodyCost(body) > spawn.room.energyCapacityAvailable) {
			body.pop();
		}

		if (body.length < 16) {
			Logging.error("Not enough capacity to spawn defender");
			return ERR_NOT_ENOUGH_RESOURCES;
		}

		return spawn.newCreep(
			body,
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					target: null,
				} as RoleDefend.Creep["memory"],
			},
			{
				role: RoleDefend.NAME,
			},
		);
	}

	public static execute(creep: RoleDefend.Creep): ScreepsReturnCode {
		if (creep.room.memory.attackTargets.length === 0) {
			creep.memory.recycleSelf = true;
			return OK;
		}

		let target: null | Creep | PowerCreep = null;
		if (creep.memory.target) {
			target = Game.getObjectById(creep.memory.target);
			if (!target) {
				creep.memory.target = null;
			}
		}

		if (!target) {
			const targets = creep.room.memory.attackTargets
				.map(Game.getObjectById)
				.filter(c => !!c) as Array<Creep | PowerCreep>;

			if (targets.length !== 0) {
				target = creep.pos.findClosestByPath(targets, {ignoreCreeps: true});
			}
		}

		if (target) {
			creep.travelTo(target);
			creep.rangedAttack(target);
			return creep.attack(target);
		} else {
			Logging.warning(`${creep} has no target to attack`);
			return ERR_NOT_FOUND;
		}
	}
}

registerRole(RoleDefend.NAME);

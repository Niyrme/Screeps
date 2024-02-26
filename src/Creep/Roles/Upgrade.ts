import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleUpgrade.NAME]: typeof RoleUpgrade;
	}
}

export namespace RoleUpgrade {
	export interface Memory {
		readonly controller: Id<StructureController>;
		gather: boolean;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleUpgrade extends BaseRole {
	public static readonly NAME: "upgrade" = "upgrade";

	public static spawn(spawn: StructureSpawn, controller?: StructureController): StructureSpawn.SpawnCreepReturnType {
		return spawn.newGenericCreep(
			[WORK, CARRY, MOVE],
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					gather: true,
					controller: controller?.id || spawn.room.controller!.id,
				} as RoleUpgrade.Creep["memory"],
			},
			{ role: RoleUpgrade.NAME },
		);
	}

	public static execute(creep: RoleUpgrade.Creep): ScreepsReturnCode {
		if (creep.memory.gather && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = false;
		} else if ((!creep.memory.gather) && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = true;
		}

		if (creep.memory.gather) {
			return RoleUpgrade.gather(creep);
		} else {
			const controller = Game.getObjectById(creep.memory.controller)!;

			const err = creep.upgradeController(controller);
			if (err === ERR_NOT_IN_RANGE) {
				creep.travelTo(controller, { range: 3 });
				return creep.upgradeController(controller);
			}
			return err;
		}
	}
}

registerRole(RoleUpgrade.NAME);

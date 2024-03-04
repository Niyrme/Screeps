import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleExtract.NAME]: typeof RoleExtract;
	}
}

export namespace RoleExtract {
	export interface Memory {
		readonly mineral: Id<Mineral>;
		atMineral: boolean;
	}

	export type Creep = BaseCreep<Memory>
}

// @ts-expect-error
export class RoleExtract extends BaseRole {
	public static readonly NAME: "extract" = "extract";

	public static spawn(spawn: StructureSpawn, mineral: RoleExtract.Memory["mineral"]): StructureSpawn.SpawnCreepReturnType {
		const body = ([] as Array<BodyPartConstant>).concat(
			_.flatten(_.fill(new Array(2), MOVE)),
			_.flatten(_.fill(new Array(5), WORK)),
			_.flatten(_.fill(new Array(3), MOVE)),
		);

		while (Creep.getBodyCost(body) > spawn.room.energyCapacityAvailable) {
			body.pop();
		}

		if (body.length < 3) {
			return ERR_NOT_ENOUGH_RESOURCES;
		}

		return spawn.newCreep(
			body,
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					atMineral: false,
					mineral,
				} satisfies RoleExtract.Creep["memory"] as RoleExtract.Creep["memory"],
			},
			{
				role: this.NAME,
			},
		);
	}

	public static execute(creep: RoleExtract.Creep): ScreepsReturnCode {
		const mineral = Game.getObjectById(creep.memory.mineral)!;

		if (!creep.memory.atMineral) {
			const [container] = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
				filter: (s): s is Extract<typeof s, StructureContainer> => s.structureType === STRUCTURE_CONTAINER,
			});

			if (container) {
				creep.travelTo(container, { range: 0 });
				if (!creep.pos.isEqualTo(container)) {
					return ERR_NOT_IN_RANGE;
				} else {
					creep.memory.atMineral = true;
				}
			} else {
				creep.travelTo(mineral);
				if (creep.pos.isNearTo(mineral)) {
					creep.memory.atMineral = true;
				} else {
					return ERR_NOT_IN_RANGE;
				}
			}
		}

		return creep.harvest(mineral);
	}
}

registerRole(RoleExtract.NAME);

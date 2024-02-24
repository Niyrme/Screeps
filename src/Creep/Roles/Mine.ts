import { Logging, UnreachableError } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleMine.NAME]: typeof RoleMine;
	}
}

export namespace RoleMine {
	interface BaseMemory {
		readonly source: Id<Source>;
	}

	interface MinerMemory {
		readonly minerRole: string;
		atSource: boolean;
	}

	interface DropMemory extends MinerMemory {
		readonly minerRole: "drop";
	}

	interface LinkMemory extends MinerMemory {
		readonly minerRole: "link";
		readonly link: Id<StructureLink>;
	}

	export type Memory = BaseMemory & (DropMemory | LinkMemory)

	export type Creep = BaseCreep<Memory>
}

export class RoleMine extends BaseRole {
	public static readonly NAME: "mine" = "mine";

	spawn(spawn: StructureSpawn, memory: Omit<RoleMine.Memory, "atSource">): StructureSpawn.SpawnCreepReturnType {
		let body: Array<BodyPartConstant>;
		switch (memory.minerRole) {
			case "drop": {
				body = [MOVE, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE];
				while (Creep.getBodyCost(body)) { body.pop(); }
				if (body.length < 2) { return ERR_NOT_ENOUGH_RESOURCES; }
				break;
			}
			case "link":
				body = [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE];
				if (Creep.getBodyCost(body) > spawn.room.energyCapacityAvailable) { return ERR_NOT_ENOUGH_RESOURCES; }
				break;
			default:
				throw new UnreachableError(`RoleMine.spawn role = ${memory.minerRole}`);
		}

		return spawn.newCreep(
			body,
			{
				memory: {
					recycleSelf: false,
					atSource: false,
					...memory,
				} as RoleMine.Creep["memory"],
			},
			{
				role: "mine",
			},
		);
	}

	execute(creep: RoleMine.Creep): ScreepsReturnCode {
		const source = Game.getObjectById(creep.memory.source)!;

		if (!creep.memory.atSource) {
			switch (creep.memory.minerRole) {
				case "drop": {
					if (creep.pos.isNearTo(source)) {
						creep.memory.atSource = true;
						break;
					}
					return creep.travelTo(source);
				}
				case "link": {
					const link = Game.getObjectById(creep.memory.link)!;
					if (creep.pos.isNearTo(source) && creep.pos.isNearTo(link)) {
						creep.memory.atSource = true;
						break;
					}

					if (!creep.pos.isNearTo(source)) {
						return creep.travelTo(source);
					} else if (creep.pos.getRangeTo(link) > 3) {
						Logging.error(`${creep} is stuck getting into position at link`);
						return ERR_INVALID_ARGS;
					} else {
						return creep.travelTo(link);
					}
				}
				default:
					// @ts-expect-error
					throw new UnreachableError(`${creep}.memory.mineRole = ${creep.memory.minerRole}`);
			}
		}

		return creep.harvest(source);
	}
}

registerRole(RoleMine.NAME);

import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleRepair.NAME]: typeof RoleRepair;
	}
}

export namespace RoleRepair {
	export interface Memory {
		gather: boolean;
		structure: null | Id<AnyStructure>;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleRepair extends BaseRole {
	public static readonly NAME: "repair" = "repair";

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		return spawn.newGenericCreep(
			[WORK, CARRY, MOVE],
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					gather: true,
					structure: null,
				} as RoleRepair.Creep["memory"],
			},
			{
				role: RoleRepair.NAME,
			},
		);
	}

	public static execute(creep: RoleRepair.Creep): ScreepsReturnCode {
		if (creep.memory.gather && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = false;
		} else if ((!creep.memory.gather) && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.gather = true;
		}

		if (creep.memory.gather) {
			return RoleRepair.gather(creep);
		} else {
			let structure: null | AnyStructure = null;

			if (creep.memory.structure) {
				structure = Game.getObjectById(creep.memory.structure);
				if (
					(structure && !(structure.hits < structure.hitsMax))
					|| structure?.structureType === STRUCTURE_RAMPART
					|| structure?.structureType === STRUCTURE_WALL
				) {
					structure = null;
					creep.memory.structure = null;
				}
			}

			structure ||= RoleRepair.findRepairTarget(creep);
			if (structure) {
				creep.memory.structure = structure.id;

				const err = creep.repair(structure);
				if (err === ERR_NOT_IN_RANGE) {
					creep.travelTo(structure, { range: 3 });
					return creep.repair(structure);
				}
				return err;
			} else {
				creep.memory.recycleSelf = true;
				return ERR_NOT_FOUND;
			}
		}
	}

	private static findRepairTarget(creep: Creep): null | AnyStructure {
		const hasTower = creep.room.find(FIND_MY_STRUCTURES, {
			filter: s => s.structureType === STRUCTURE_TOWER,
		}).length !== 0;

		const { walls, ramparts, rest } = creep.room.getDamagedStructures({
			walls: true,
			ramparts: true,
			rest: !hasTower,
		}) as {
			walls: Array<StructureWall>,
			ramparts: Array<StructureRampart>,
			rest: null | Array<Exclude<AnyStructure, StructureRampart | StructureWall>>
		};

		if (rest && rest.length !== 0) {
			const owned = rest.filter(s => ("my" in s) && s.my) as Array<Exclude<AnyOwnedStructure, StructureRampart>>;
			if (owned.length !== 0) {
				return creep.pos.findClosestByPath(owned);
			}

			const roadsContainers = rest.filter(s => s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER) as Array<StructureRoad | StructureContainer>;
			if (roadsContainers.length !== 0) {
				return creep.pos.findClosestByPath(roadsContainers);
			}

			return creep.pos.findClosestByPath(rest);
		}

		if (ramparts.length !== 0) {
			const rs = ramparts.filter(rampart => rampart.hits < 300000 && ((rampart.hits / rampart.hitsMax) < 0.3));
			if (rs.length !== 0) {
				let rampart: undefined | StructureRampart = undefined;
				for (let i = 0; i < 1; i += 0.0001) {
					if ((rampart = _.find(rs, r => (r.hits / r.hitsMax) < i))) {
						return rampart;
					}
				}
			}
		}

		if (walls.length !== 0) {
			let wall: undefined | StructureWall = undefined;
			for (let i = 0; i < 1; i += 0.0001) {
				if ((wall = _.find(walls, w => (w.hits / w.hitsMax) < i))) {
					return wall;
				}
			}
		}

		return null;
	}
}

registerRole(RoleRepair.NAME);

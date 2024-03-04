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
		const [structure] = this.findRepairTargets(spawn.room);

		return spawn.newGenericCreep(
			[WORK, CARRY, MOVE],
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					gather: true,
					structure: structure?.id || null,
				} satisfies RoleRepair.Creep["memory"] as RoleRepair.Creep["memory"],
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
			return this.gather(creep);
		} else {
			let structure: null | AnyStructure = null;

			if (creep.memory.structure) {
				structure = Game.getObjectById(creep.memory.structure);
				if (
					(!structure)
					|| (!(structure.hits < structure.hitsMax))
					|| structure.structureType === STRUCTURE_RAMPART
					|| structure.structureType === STRUCTURE_WALL
				) {
					structure = null;
					creep.memory.structure = null;
				}
			}

			structure ||= creep.pos.findClosestByPath(RoleRepair.findRepairTargets(creep.room));
			if (structure) {
				creep.memory.structure = structure.id;

				creep.travelTo(structure, { range: 3 });
				return creep.repair(structure);
			} else {
				creep.memory.recycleSelf = true;
				return ERR_NOT_FOUND;
			}
		}
	}

	private static findRepairTargets(room: Room): Array<AnyStructure> {
		const hasTower = room.find(FIND_MY_STRUCTURES, {
			filter: s => s.structureType === STRUCTURE_TOWER,
		}).length !== 0;

		const damagedStructures = room.getDamagedStructures();
		const rest = hasTower
			? damagedStructures.filter((s): s is Exclude<typeof s, StructureWall | StructureRampart> => !(s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART))
			: [];

		if (rest.length !== 0) {
			const owned = rest.filter((s): s is Extract<typeof s, AnyOwnedStructure> => ("my" in s) && s.my);
			if (owned.length !== 0) {
				return owned;
			}

			const roadsContainers = rest.filter(s => s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER) as Array<StructureRoad | StructureContainer>;
			if (roadsContainers.length !== 0) {
				return roadsContainers;
			}

			return rest;
		}

		const rampartsWalls = damagedStructures.filter((s): s is StructureWall | StructureRampart => s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART);
		if (rampartsWalls.length !== 0) {
			for (let i = 0; i < 1; i += 0.0001) {
				const structures = _.filter(rampartsWalls, r => (r.hits / r.hitsMax) < i && (
					r.structureType === STRUCTURE_RAMPART ? r.hits < 300000 : true
				));
				if (structures.length !== 0) {
					return structures;
				}
			}
		}

		return [];
	}
}

registerRole(RoleRepair.NAME);

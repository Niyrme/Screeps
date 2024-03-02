import type { RoleMine } from "Creep";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleHarvest.NAME]: typeof RoleHarvest;
	}
}

export namespace RoleHarvest {
	export interface Memory {
		source: null | Id<Source>;
		harvest: boolean;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleHarvest extends BaseRole {
	public static readonly NAME: "harvest" = "harvest";

	public static spawn(spawn: StructureSpawn, bootstrap: boolean = false): StructureSpawn.SpawnCreepReturnType {
		const baseBody: Array<BodyPartConstant> = [WORK, CARRY, MOVE];
		const size = Math.clamp(
			Math.floor(
				(
					bootstrap
						? spawn.room.energyAvailable
						: spawn.room.energyCapacityAvailable
				) / Creep.getBodyCost(baseBody),
			),
			1,
			spawn.room.controller!.level + 1,
		);

		return spawn.newCreep(
			_.flatten(_.fill(new Array(size), baseBody)),
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					harvest: true,
					source: null,
				} as RoleHarvest.Creep["memory"],
			},
			{ role: RoleHarvest.NAME },
		);
	}

	public static execute(creep: RoleHarvest.Creep): ScreepsReturnCode {
		if (creep.memory.harvest && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.harvest = false;
		} else if ((!creep.memory.harvest) && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
			creep.memory.harvest = true;
		}

		if (creep.memory.harvest) {
			let source: Source;
			if (creep.memory.source) {
				source = Game.getObjectById(creep.memory.source)!;
			} else {
				const sources = creep.room.find(FIND_SOURCES, {
					filter: source => !_.find(
						Game.creeps,
						c => c.decodeName().role === "mine" && (c as RoleMine.Creep).memory.source === source.id,
					),
				});

				if (sources.length === 0) {
					creep.memory.recycleSelf = true;
					return ERR_NOT_FOUND;
				} else if (sources.length === 1) {
					[source] = sources;
				} else {
					const active = sources.filter(s => s.energy !== 0);
					source = creep.pos.findClosestByPath(active.length !== 0 ? active : sources, {
						ignoreCreeps: true,
					})!;
				}

				creep.memory.source = source.id;
			}

			creep.travelTo(source);
			return creep.harvest(source);
		} else {
			type EnergyStructure = StructureSpawn | StructureExtension | StructureTower
			const structures: Array<EnergyStructure> = creep.room.find(FIND_MY_STRUCTURES, {
				filter(s) {
					switch (s.structureType) {
						case STRUCTURE_SPAWN:
						case STRUCTURE_EXTENSION:
						case STRUCTURE_TOWER:
							return s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
						default:
							return false;
					}
				},
			});

			const notTowers = structures.filter(s => s.structureType !== STRUCTURE_TOWER) as Array<Exclude<EnergyStructure, StructureTower>>;

			let dest: null | EnergyStructure | StructureStorage | StructureContainer = creep.pos.findClosestByPath(
				notTowers.length !== 0
					? notTowers
					: structures,
				{ ignoreCreeps: true },
			);

			if ((!dest) && creep.room.storage) {
				dest = creep.room.storage;
			}

			if (!dest) {
				const flag = Game.flags[creep.room.name] || Game.flags[creep.memory.home];
				if (flag) {
					const [container] = flag.pos.lookFor(LOOK_STRUCTURES)
						.filter(s => s.structureType === STRUCTURE_CONTAINER) as Array<StructureContainer>;

					if (container) {
						dest = container;
					}
				}
			}

			if (dest) {
				creep.travelTo(dest);
				return creep.transfer(dest, RESOURCE_ENERGY);
			} else {
				return ERR_NOT_FOUND;
			}
		}
	}
}

registerRole(RoleHarvest.NAME);

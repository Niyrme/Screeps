import { Logging } from "Utils";
import { BaseRole } from "./_base.ts";
import { registerRole } from "./_util.ts";

declare global {
	interface AllRoles {
		[RoleManage.NAME]: typeof RoleManage;
	}
}

export namespace RoleManage {
	export namespace Memory {
		export interface FillMany {
			readonly resource: ResourceConstant;
			readonly ids: Array<[Id<AnyStoreStructure>, number]>;
			idx: number;
			gather: boolean;
		}
	}

	export interface Memory {
		fillMany: null | Memory.FillMany;
	}

	export type Creep = BaseCreep<Memory>
}

export class RoleManage extends BaseRole {
	public static readonly NAME: "manage" = "manage";

	public static spawn(spawn: StructureSpawn, bootstrap = false): StructureSpawn.SpawnCreepReturnType {
		const baseBody: Array<BodyPartConstant> = [CARRY, MOVE];
		const body = _.flatten(_.fill(
			new Array(Math.floor((
				bootstrap
					? spawn.room.energyAvailable
					: spawn.room.energyCapacityAvailable
			) / Creep.getBodyCost(baseBody))),
			baseBody,
		));

		return spawn.newCreep(
			body,
			{
				memory: {
					home: spawn.room.name,
					recycleSelf: false,
					fillMany: null,
				} satisfies RoleManage.Creep["memory"] as RoleManage.Creep["memory"],
			},
			{
				role: this.NAME,
			},
		);
	}

	public static execute(creep: RoleManage.Creep): ScreepsReturnCode {
		const storage = this.getBaseStorage(creep);
		if (!storage) {
			Logging.error(`${creep} has no storage`);
			return ERR_NOT_FOUND;
		}

		if (creep.memory.fillMany) {
			const { ids, resource } = creep.memory.fillMany;
			let { gather } = creep.memory.fillMany;
			const structures = ids
				.map((arg) => [Game.getObjectById(arg[0]), arg[1]] as [null | AnyStoreStructure, number])
				.filter((arg): arg is [Exclude<(typeof arg)[0], null>, (typeof arg)[1]] => !!arg[0]);

			if (gather) {
				const requiredAmount = structures.reduce((total, [, amount]) => total + amount, 0);

				creep.travelTo(storage);
				const err = creep.withdraw(storage, resource, Math.clamp(
					requiredAmount - creep.store.getUsedCapacity(resource),
					0,
					creep.store.getCapacity(resource),
				));

				switch (err) {
					case OK:
					case ERR_NOT_ENOUGH_RESOURCES:
					case ERR_FULL:
						creep.memory.fillMany.gather = gather = false;
						break;
					default:
						return err;
				}
			}

			if (!gather) {
				const { idx } = creep.memory.fillMany;
				if (idx >= structures.length) {
					creep.memory.fillMany = null;
					return ERR_NOT_FOUND;
				}

				const [structure, amount] = structures[idx];
				creep.travelTo(structure);
				const err = creep.transfer(
					structure,
					resource,
					Math.min(amount, structure.store.getFreeCapacity(resource) || Infinity),
				);
				switch (err) {
					case OK:
						creep.memory.fillMany.idx++;
						break;
					case ERR_NOT_ENOUGH_RESOURCES:
						Logging.error(`${creep} did not gather enough energy`);
						creep.memory.fillMany = null;
						break;
				}
				return err;
			}
		}

		{
			const baseFlag = Game.flags[creep.room.name];

			const structures = creep.room.getTickCache().structures
				.map<null | AnyStructure>(Game.getObjectById)
				.filter((s): s is Exclude<typeof s, null> => !!s)
				.filter((s): s is Extract<typeof s, AnyStoreStructure> => "store" in s);

			const [link] = structures.filter((s): s is Extract<typeof s, StructureLink> => {
				return s.structureType === STRUCTURE_LINK
					&& s.store.getUsedCapacity(RESOURCE_ENERGY) !== 0
					&& s.pos.isNearTo(baseFlag);
			});

			if (link && creep.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
				creep.travelTo(baseFlag, { range: 0 });
				return creep.withdraw(link, RESOURCE_ENERGY);
			}

			{
				const err = creep.dumpAllResources(storage);
				if (err !== ERR_NOT_ENOUGH_RESOURCES) {
					return err;
				}
			}

			const storedEnergy = storage.store.getUsedCapacity(RESOURCE_ENERGY);
			if (storedEnergy !== 0) {
				let availableCapacity = Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), storedEnergy);

				const sinks = structures.filter((s): s is Extract<typeof s, StructureSpawn | StructureExtension | StructureTower> => {
					switch (s.structureType) {
						case STRUCTURE_SPAWN:
						case STRUCTURE_EXTENSION:
						case STRUCTURE_TOWER:
							return s.store.getFreeCapacity(RESOURCE_ENERGY) !== 0;
						default:
							return false;
					}
				});

				if (sinks.length !== 0) {
					const ids: RoleManage.Memory.FillMany["ids"] = [];

					sinks.forEach(sink => {
						const free = sink.store.getFreeCapacity(RESOURCE_ENERGY);
						if (free < availableCapacity) {
							ids.push([sink.id, free]);
							availableCapacity -= free;
						}
					});

					if (ids.length !== 0) {
						creep.memory.fillMany = {
							ids,
							resource: RESOURCE_ENERGY,
							gather: true,
							idx: 0,
						};
					} else {
						creep.memory.fillMany = {
							ids: [[sinks[0].id, sinks[0].store.getFreeCapacity(RESOURCE_ENERGY)]],
							resource: RESOURCE_ENERGY,
							gather: true,
							idx: 0,
						};
					}
					return OK;
				}
			}

			creep.travelTo(baseFlag, { range: 0 });
		}

		return OK;
	}
}

registerRole(RoleManage.NAME);

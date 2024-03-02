import { NotImplementedError, UnreachableError } from "Utils";

export abstract class BaseRole {
	public static readonly NAME: string;

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	public static execute(creep: Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}

	protected static renew(creep: Creep): ScreepsReturnCode {
		const spawns = creep.room.getTickCache().freeSpawns
			.map<null | StructureSpawn>(Game.getObjectById)
			.filter((s): s is Exclude<typeof s, null> => !!s);

		const spawn = creep.pos.findClosestByPath(spawns, {
			filter: s => s.store.getUsedCapacity(RESOURCE_ENERGY) !== 0,
		});

		if (spawn) {
			creep.travelTo(spawn);
			return spawn.renewCreep(creep);
		} else {
			return ERR_NOT_FOUND;
		}
	}

	protected static getBaseStorage(creep: Creep): null | StructureStorage | StructureContainer {
		const { baseStorage } = creep.room.getTickCache();

		if (baseStorage) {
			return Game.getObjectById(baseStorage);
		} else {
			return null;
		}
	}

	protected static gather(creep: Creep, resource: ResourceConstant = RESOURCE_ENERGY, fromStorage: boolean = true): ScreepsReturnCode {
		if (fromStorage && creep.room.storage && creep.room.storage.store.getUsedCapacity(resource) !== 0) {
			creep.travelTo(creep.room.storage);
			return creep.withdraw(creep.room.storage, resource);
		}

		const resources = creep.room.getResources(resource);
		const tempResources = [
			...resources.dropped.map(d => Game.getObjectById(d.id)),
			...resources.tombstones.map(t => Game.getObjectById(t.id)),
			...resources.ruins.map(r => Game.getObjectById(r.id)),
		];

		let sources = (
			tempResources.length !== 0
				? tempResources
				: resources.strucutres.map(s => Game.getObjectById(s.id))
		)
			.filter((v): v is Exclude<typeof v, null> => !!v)
			.filter((r): r is Exclude<typeof r, StructureLink> => {
				if ("structureType" in r) {
					return r.structureType !== STRUCTURE_LINK;
				} else {
					return true;
				}
			});

		if (!fromStorage) {
			sources = sources.filter((s): s is Exclude<typeof s, StructureStorage> => ("structureType" in s)
				? s.structureType !== STRUCTURE_STORAGE
				: true);
		}

		const withEnough = sources.filter(s => {
			const free = creep.store.getFreeCapacity(resource);
			if ("store" in s) {
				return (s.store.getUsedCapacity(resource) || -Infinity) >= free;
			} else if ("amount" in s) {
				return s.amount > free;
			} else {
				throw new UnreachableError(`${this}.gather(${creep}) source is neither structure nor dropped: ${s}`);
			}
		});

		const src = creep.pos.findClosestByPath(
			withEnough.length !== 0 ? withEnough : sources,
			{ ignoreCreeps: true },
		);

		if (!src) {
			return ERR_NOT_FOUND;
		}

		if ((src as Resource<RESOURCE_ENERGY>).amount) {
			const resource = src as Resource<RESOURCE_ENERGY>;
			creep.travelTo(resource);
			return creep.pickup(resource);
		} else {
			const structure = src as Exclude<typeof src, Resource>;
			creep.travelTo(structure);
			return creep.withdraw(structure, resource);
		}
	}
}

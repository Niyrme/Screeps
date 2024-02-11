import { roleConstruct, roleHarvest, roleHaul, roleMine, roleRepair, roleUpgrade } from "../../Creep/roles/_index.ts";
import { UnhandledError } from "../../util/errors.ts";

export function roomSpawning(room: Room) {
	const spawns = room.find(FIND_MY_SPAWNS, {
		filter: s => !s.spawning,
	});

	if (spawns.length === 0) {
		return;
	}

	let triedSpawn = false;

	const handleSpawnError = (err: ScreepsReturnCode) => {
		switch (err) {
			case OK:
				spawns.shift();
				triedSpawn = true;
				break;
			case ERR_NOT_ENOUGH_RESOURCES:
				triedSpawn = true;
				break;
			default:
				throw new UnhandledError(err);
		}
	};

	const spawnMany = (spawnFn: (spawn: StructureSpawn) => ScreepsReturnCode, count: number) => {
		for (let i = 0; i < count; i++) {
			if (spawns.length === 0) {
				return;
			}

			handleSpawnError(spawnFn(spawns[0]));
		}
	};

	const creeps = _.filter(Game.creeps, creep => creep.memory.homeRoom === room.name);

	if (creeps.length === 0) {
		for (const spawn of spawns) {
			roleHarvest.spawn(spawn, true);
		}
		return;
	}

	for (const sourceId of Object.keys(room.memory.resources.energy)) {
		if (spawns.length === 0) {
			return;
		}

		const source = Game.getObjectById(sourceId)!;
		const miner = _.find(creeps, creep => creep.memory.role === "mine" && (creep as Roles.Mine.creep).memory.source === source.id);

		if (!miner) {
			handleSpawnError(roleMine.spawn(spawns[0]));
		}
	}

	if (triedSpawn || spawns.length === 0) {
		return;
	}

	const haulers = creeps.filter(creep => creep.memory.role === "haul") as Array<Roles.Haul.creep>;
	spawnMany(roleHaul.spawn, (Object.keys(room.memory.resources.energy).length * 2) - haulers.length);

	if (triedSpawn || spawns.length === 0) {
		return;
	}

	const upgraders = creeps.filter(creep => creep.memory.role === "upgrade") as Array<Roles.Upgrade.creep>;
	spawnMany(roleUpgrade.spawn, Math.ceil(Math.sqrt(9 - room.controller!.level)) - upgraders.length);

	if (triedSpawn || spawns.length === 0) {
		return;
	}

	const repairers = creeps.filter(creep => creep.memory.role === "repair") as Array<Roles.Repair.creep>;
	const damagedStructures: Array<AnyOwnedStructure | StructureContainer | StructureWall> = room.find(FIND_STRUCTURES, {
		filter: s => (("my" in s && s.my) || _.includes([STRUCTURE_CONTAINER, STRUCTURE_WALL], s.structureType)) && s.hits < s.hitsMax,
	});
	spawnMany(roleRepair.spawn, Math.ceil(Math.sqrt(damagedStructures.length)) - repairers.length);

	if (triedSpawn || spawns.length === 0) {
		return;
	}

	const constructors = creeps.filter(creep => creep.memory.role === "construct") as Array<Roles.Construct.creep>;
	const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
	spawnMany(roleConstruct.spawn, Math.ceil(Math.sqrt(constructionSites.length)) - constructors.length);
}

export default roomSpawning;

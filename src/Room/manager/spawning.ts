import {
	ROLE_BUILD,
	ROLE_HAUL,
	ROLE_MINE_DROP,
	ROLE_MINE_LINK,
	ROLE_REPAIR,
	ROLE_UPGRADE,
	roleBuild,
	roleHarvest,
	roleHaul,
	roleMineDrop,
	roleMineLink,
	roleUpgrade,
} from "Creep";
import { clamp } from "util";

export function roomSpawning(room: Room) {
	const spawns = room.find(FIND_MY_SPAWNS, {
		filter: s => !s.spawning,
	});
	if (spawns.length === 0) { return; }

	const creeps = _.filter(Game.creeps, c => c.memory.home === room.name);

	if (creeps.length === 0) {
		for (const spawn of spawns) {
			roleHarvest.spawn(spawn, true);
		}
		return;
	}

	const handleSpawnError = (err: StructureSpawn.SpawnCreepReturnType, shiftOnNoEnergy = false) => {
		switch (err) {
			case OK:
				spawns.shift();
				break;
			case ERR_NOT_ENOUGH_RESOURCES:
				shiftOnNoEnergy && spawns.shift();
				break;
		}
	};

	let minerCount = 0;
	for (const sourceId of Object.keys(room.memory.resources.energy)) {
		if (spawns.length === 0) { return; }

		const source = Game.getObjectById(sourceId)!;

		const miner = _.find(creeps, creep => {
			switch (creep.decodeName().role) {
				case ROLE_MINE_DROP:
				case ROLE_MINE_LINK:
					minerCount++;
					return (creep as Roles.MineDrop.Creep | Roles.MineLink.Creep).memory.source === source.id;
				default:
					return false;
			}
		});

		if (!miner) {
			if (
				source.pos.findInRange(
					FIND_MY_STRUCTURES,
					2,
					{ filter: s => s.structureType === STRUCTURE_LINK },
				).length !== 0
			) {
				handleSpawnError(roleMineLink.spawn(spawns[0], source.id), true);
			} else {
				handleSpawnError(roleMineDrop.spawn(spawns[0], source.id), true);
			}
		}
	}

	if (spawns.length === 0) { return; }

	const haulers = creeps.filter(c => c.decodeName().role === ROLE_HAUL);
	for (let i = haulers.length; i < minerCount; i++) {
		if (spawns.length === 0) { return; }
		handleSpawnError(roleHaul.spawn(spawns[0]));
	}

	if (spawns.length === 0) { return; }

	const upgraders = creeps.filter(c => c.decodeName().role === ROLE_UPGRADE) as Array<Roles.Upgrade.Creep>;
	for (let i = upgraders.length; i < clamp(9 - room.controller!.level, 1, 3); i++) {
		if (spawns.length === 0) { return; }
		handleSpawnError(roleUpgrade.spawn(spawns[0]));
	}

	const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
	if (constructionSites.length !== 0) {
		const builders = creeps.filter(c => c.decodeName().role === ROLE_BUILD) as Array<Roles.Build.Creep>;
		for (
			let i = 0;
			i < clamp(Math.ceil(Math.sqrt(constructionSites.length)) - builders.length, 0, 3);
			i++
		) {
			if (spawns.length === 0) { return; }
			handleSpawnError(roleBuild.spawn(spawns[0]));
		}
	}

	const damagedStructures = room.find(FIND_STRUCTURES, {
		filter: s => s.structureType !== STRUCTURE_WALL && s.hits < s.hitsMax,
	});
	if (damagedStructures.length !== 0) {
		const repairers = creeps.filter(c => c.decodeName().role === ROLE_REPAIR) as Array<Roles.Repair.Creep>;
		for (
			let i = 0;
			i < clamp(Math.ceil(Math.sqrt(damagedStructures.length)) - repairers.length, 0, 3);
			i++
		) {
			if (spawns.length !== 0) {return;}
		}
	}
}

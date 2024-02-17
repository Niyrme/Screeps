import {
	ROLE_HAUL,
	ROLE_MINE_DROP,
	ROLE_MINE_LINK,
	ROLE_UPGRADE,
	roleHarvest,
	roleHaul,
	roleMineDrop,
	roleMineLink,
	roleUpgrade,
} from "Creep";
import { ErrorcodeToString, Logging } from "util";

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
		Logging.debug(`handleSpawnError(${ErrorcodeToString(err)})`);
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
	for (let i = upgraders.length; i < 9 - room.controller!.level; i++) {
		if (spawns.length === 0) { return; }
		handleSpawnError(roleUpgrade.spawn(spawns[0]));
	}
}

import { RoleBuild, RoleDefend, RoleHarvest, RoleHaul, RoleManage, RoleMine, RoleRepair, RoleUpgrade } from "Creep";
import { CodeToString, Logging } from "Utils";

export function roomHandlerSpawning(room: Room) {
	if (!room.controller?.my) { return; }
	const spawns = room.find(FIND_MY_SPAWNS, {
		filter: s => !s.spawning,
	});

	if (spawns.length === 0) { return; }


	function handleSpawnError(err: StructureSpawn.SpawnCreepReturnType, shiftOnNoEnergy = false) {
		switch (err) {
			case OK:
				spawns.shift();
				break;
			case ERR_NOT_ENOUGH_RESOURCES:
				shiftOnNoEnergy && spawns.shift();
				break;
		}
		Logging.debug(`err: ${CodeToString(err)}`);
		return err;
	}

	const creeps = _.filter(Game.creeps, c => c.memory.home === room.name);

	if (creeps.length === 0) {
		for (const spawn of spawns) {
			handleSpawnError(RoleHarvest.spawn(spawn, true));
		}
		return;
	}

	function attemptSpawn(fn: (spawn: StructureSpawn) => StructureSpawn.SpawnCreepReturnType, shiftOnNoEmpty = false): boolean {
		if (spawns.length !== 0) {
			const err = handleSpawnError(fn(spawns[0]), shiftOnNoEmpty);
			if (shiftOnNoEmpty) {
				return err === OK;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}

	if (room.memory.attackTargets.length !== 0) {
		const defenders = creeps.filter((c): c is RoleDefend.Creep => c.decodeName().role === RoleDefend.NAME);

		for (let i = defenders.length; i < room.memory.attackTargets.length * 1.5; i++) {
			if (spawns.length === 0) { return; }
			handleSpawnError(RoleDefend.spawn(spawns[0]), true);
		}
	}

	const hasManager = creeps.filter((c): c is RoleManage.Creep => c.decodeName().role === RoleManage.NAME).length !== 0;
	if (!hasManager) {
		if (!attemptSpawn(spawn => RoleManage.spawn(spawn, creeps.length <= 3), true)) { return; }
	}

	for (const sourceID of Object.keys(room.memory.resources.energy)) {
		if (spawns.length === 0) { return; }

		const source = Game.getObjectById(sourceID)!;

		const miner = _.find(creeps, (creep): creep is RoleMine.Creep => {
			switch (creep.decodeName().role) {
				case RoleMine.NAME:
					return (creep as RoleMine.Creep).memory.source === source.id;
				default:
					return false;
			}
		});

		if (!miner) {
			const [link] = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
				filter: s => s.structureType === STRUCTURE_LINK,
			}) as Array<StructureLink>;

			const ok = attemptSpawn(spawn => RoleMine.spawn(spawn, {
				source: source.id,
				minerRole: (!!link) ? "link" : "drop",
				// @ts-ignore
				link: (!!link) ? link.id : undefined,
			}), true);

			if (!ok) { return; }
		}
	}

	const hasHauler = creeps.filter((c): c is RoleHaul.Creep => c.decodeName().role === RoleHaul.NAME).length !== 0;
	if (!hasHauler) {
		if (spawns.length === 0) { return; }
		handleSpawnError(RoleHaul.spawn(spawns[0]), true);
	}

	const upgraders = creeps.filter((c): c is RoleUpgrade.Creep => c.decodeName().role === RoleUpgrade.NAME);
	for (let i = upgraders.length; i < Math.clamp(9 - room.controller.level, 1, 2); i++) {
		if (!attemptSpawn(spawn => RoleUpgrade.spawn(spawn, room.controller))) { return; }
	}

	if (spawns.length === 0) { return; }

	const { damagedStructures } = room.getTickCache();
	if (damagedStructures.length !== 0) {
		const repairers = creeps.filter((c): c is RoleRepair.Creep => c.decodeName().role === RoleRepair.NAME);
		for (
			let i = repairers.length;
			i < Math.clamp(Math.floor(Math.sqrt(damagedStructures.length)), 0, 3);
			i++
		) {
			if (!attemptSpawn(spawn => RoleRepair.spawn(spawn))) { return; }
		}
	}

	if (spawns.length === 0) { return; }

	const { constructionSites } = room.getTickCache();
	if (constructionSites.length !== 0) {
		const builders = creeps.filter((c): c is RoleBuild.Creep => c.decodeName().role === RoleBuild.NAME);
		const constructionCost = constructionSites.reduce((cost, site) => cost + site.progressTotal - site.progress, 0);
		for (
			let i = builders.length;
			i < Math.clamp(Math.floor(Math.sqrt(constructionCost / 1000)), 1, 3);
			i++
		) {
			if (!attemptSpawn(spawn => RoleBuild.spawn(spawn))) { return; }
		}
	}
}

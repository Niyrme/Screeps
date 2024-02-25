import { RoleHarvest, RoleMine } from "Creep";

export function roomHandlerSpawning(room: Room) {
	if (!room.controller?.my) { return; }
	const spawns = room.find(FIND_MY_SPAWNS, {
		filter: s => !s.spawning,
	});

	if (spawns.length === 0) { return; }

	const creeps = _.filter(Game.creeps, c => c.memory.home === room.name);

	if (creeps.length === 0) {
		for (const spawn of spawns) {
			RoleHarvest.spawn(spawn);
		}
		return;
	}

	function handleSpawnError(err: StructureSpawn.SpawnCreepReturnType, shiftOnNoEnergy = false) {
		switch (err) {
			case OK:
				spawns.shift();
				break;
			case ERR_NOT_ENOUGH_RESOURCES:
				shiftOnNoEnergy && spawns.shift();
				break;
		}
		return err;
	}

	let minerCount = 0;
	for (const sourceID of Object.keys(room.memory.resources.energy)) {
		if (spawns.length === 0) { return; }

		const source = Game.getObjectById(sourceID)!;

		const miner = _.find(creeps, creep => {
			switch (creep.decodeName().role) {
				case RoleMine.NAME:
					minerCount++;
					return (creep as RoleMine.Creep).memory.source === source.id;
				default:
					return false;
			}
		});

		if (!miner) {
			const hasLink = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
				filter: s => s.structureType === STRUCTURE_LINK,
			}).length !== 0;

			handleSpawnError(
				RoleMine.spawn(spawns[0], {
					source: source.id,
					minerRole: hasLink ? "link" : "drop",
				}),
				true,
			);
		}
	}
}

function findDamagedStructure(room: Room): null | AnyStructure {
	if (room.memory.repairTarget) {
		const target = Game.getObjectById(room.memory.repairTarget);
		if (target && (target.hits < target.hitsMax)) {
			return target;
		} else {
			room.memory.repairTarget = null;
		}
	}

	const structures = room.find(FIND_STRUCTURES, {
		filter: s => s.structureType !== STRUCTURE_WALL && s.hits < s.hitsMax,
	});
	if (structures.length === 0) {
		return null;
	}

	const reduceDamaged = (weakest: AnyStructure, current: AnyStructure) => (current.hitsMax - current.hits) < (weakest.hitsMax - weakest.hits) ? current : weakest;

	const notRampart = structures.filter(s => s.structureType !== STRUCTURE_RAMPART);
	if (notRampart.length !== 0) {
		return notRampart.reduce(reduceDamaged);
	} else {
		return structures.reduce(reduceDamaged);
	}
}

export function roomRepair(room: Room) {
	if (room.memory.attackTarget || room.memory.healTarget) {
		return;
	}

	const structure = findDamagedStructure(room);
	if (structure) {
		room.memory.repairTarget = structure.id;

		const towers = room.find(FIND_MY_STRUCTURES, {
			filter: s => s.structureType === STRUCTURE_TOWER,
		}) as Array<StructureTower>;
		towers.forEach(tower => {
			const energyFill = tower.store.getUsedCapacity(RESOURCE_ENERGY) / tower.store.getCapacity(RESOURCE_ENERGY);
			if (energyFill > 0.8) {
				tower.repair(structure);
			}
		});
	}
}

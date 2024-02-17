function findHurtCreep(room: Room): null | Creep {
	if (room.memory.healTarget) {
		const creep = Game.getObjectById(room.memory.healTarget);
		if (creep && (creep.hits < creep.hitsMax)) {
			return creep;
		} else {
			room.memory.healTarget = null;
		}
	}

	const hurt = room.find(FIND_MY_CREEPS, {
		filter: c => c.hits < c.hitsMax,
	});
	if (hurt.length === 0) {
		return null;
	}

	return hurt.reduce((weakest, current) => current.hits > weakest.hits ? current : weakest);
}

export function roomHeal(room: Room) {
	if (room.memory.attackTarget) {
		return;
	}

	const hurt = findHurtCreep(room);
	if (hurt) {
		room.memory.healTarget = hurt.id;

		const towers = room.find(FIND_MY_STRUCTURES, {
			filter: s => s.structureType === STRUCTURE_TOWER,
		}) as Array<StructureTower>;

		towers.forEach(tower => tower.heal(hurt));
	}
}

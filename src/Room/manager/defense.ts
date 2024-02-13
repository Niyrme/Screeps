function findTarget(room: Room): null | Creep {
	if (room.memory.attackTarget) {
		const target = Game.getObjectById(room.memory.attackTarget);
		if (target) {
			return target;
		} else {
			room.memory.attackTarget = null;
		}
	}

	const hostiles = room.find(FIND_HOSTILE_CREEPS);
	if (hostiles.length === 0) {
		return null;
	}

	const filterWeakest = (type: BodyPartConstant): null | Creep => {
		const targets = hostiles.filter(c => _.includes(c.body.map(p => p.type), type));
		if (targets.length === 0) {
			return null;
		} else {
			return targets.reduce((weakest, current) => current.hits < weakest.hits ? current : weakest);
		}
	};

	return filterWeakest(HEAL)
		|| filterWeakest(RANGED_ATTACK)
		|| filterWeakest(ATTACK);
}

export function roomDefense(room: Room) {
	const target = findTarget(room);

	if (target) {
		room.memory.attackTarget = target.id;
		const towers = room.find(FIND_MY_STRUCTURES, {
			filter: s => s.structureType === STRUCTURE_TOWER,
		}) as Array<StructureTower>;

		towers.forEach(tower => tower.attack(target));
	}
}

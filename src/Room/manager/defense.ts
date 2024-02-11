function findTarget(room: Room): null | Creep {
	if (room.memory.attackEnemy) {
		const target = Game.getObjectById(room.memory.attackEnemy);
		if (target?.pos.roomName === room.name) {
			return target;
		} else {
			room.memory.attackEnemy = null;
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
	if (!room.controller?.my) {
		return;
	}

	const target = findTarget(room);

	if (target) {
		const towers = room.find(FIND_MY_STRUCTURES, {
			filter: s => s.structureType === STRUCTURE_TOWER,
		}) as Array<StructureTower>;

		towers.forEach(tower => tower.attack(target));
	}
}

export default roomDefense;

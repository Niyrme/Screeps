import { catchNotImplemented, Logging, UnreachableError } from "util";
import {
	ROLE_BUILD,
	ROLE_EXPLORE,
	ROLE_HARVEST,
	ROLE_HAUL,
	ROLE_MANAGE,
	ROLE_MINE_DROP,
	ROLE_MINE_LINK,
	ROLE_REPAIR,
	ROLE_UPGRADE,
	roleBuild,
	roleExplore,
	roleHarvest,
	roleHaul,
	roleManage,
	roleMineDrop,
	roleMineLink,
	roleRepair,
	roleUpgrade,
} from "../roles/_index.ts";

export function manageCreep(creep: Creep) {
	if (!creep.my) {
		return;
	}

	if (creep.spawning) {
		return;
	}

	if (creep.memory.recycleSelf) {
		const spawns = creep.room.find(FIND_MY_SPAWNS);
		if (spawns.length === 0) {
			Logging.error(`${creep} has no spawn to recycle at`);
			return;
		}

		const withContainer = spawns.filter(s => {
			return s.pos.findInRange(
				FIND_STRUCTURES,
				1,
				{ filter: s => s.structureType === STRUCTURE_CONTAINER },
			).length !== 0;
		});

		const spawn = creep.pos.findClosestByPath(
			withContainer.length !== 0
				? withContainer
				: spawns,
		)!;

		const err = spawn.recycleCreep(creep);
		switch (err) {
			case OK:
				break;
			case ERR_NOT_IN_RANGE:
				creep.travelTo(spawn);
				break;
		}
		return;
	}

	const { role } = creep.decodeName();
	catchNotImplemented(() => {
		switch (role) {
			case ROLE_BUILD:
				roleBuild.run.apply(creep as Roles.Build.Creep);
				break;
			case ROLE_EXPLORE:
				roleExplore.run.apply(creep as Roles.Explore.Creep);
				break;
			case ROLE_HARVEST:
				roleHarvest.run.apply(creep as Roles.Harvest.Creep);
				break;
			case ROLE_HAUL:
				roleHaul.run.apply(creep as Roles.Haul.Creep);
				break;
			case ROLE_MANAGE:
				roleManage.run.apply(creep as Roles.Manage.Creep);
				break;
			case ROLE_MINE_DROP:
				roleMineDrop.run.apply(creep as Roles.MineDrop.Creep);
				break;
			case ROLE_MINE_LINK:
				roleMineLink.run.apply(creep as Roles.MineLink.Creep);
				break;
			case ROLE_REPAIR:
				roleRepair.run.apply(creep as Roles.Repair.Creep);
				break;
			case ROLE_UPGRADE:
				roleUpgrade.run.apply(creep as Roles.Upgrade.Creep);
				break;
			default:
				throw new UnreachableError(`${creep} role ${role}`);
		}
	});
}

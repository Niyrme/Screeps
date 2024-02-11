import { roleConstruct, roleHarvest, roleHaul, roleMine, roleRepair, roleUpgrade } from "../roles/_index.ts";

const roles: Record<string, Roles.CreepRole["run"]> = {
	construct: roleConstruct.run,
	harvest: roleHarvest.run,
	haul: roleHaul.run,
	mine: roleMine.run,
	repair: roleRepair.run,
	upgrade: roleUpgrade.run,
};

export function manageCreep(creep: Creep) {
	roles[creep.memory.role](creep);
}

export default manageCreep;

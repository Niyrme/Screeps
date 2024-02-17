import { NotImplementedError } from "util";
import { roleBuild, roleExplore, roleHaul, roleManage, roleMineDrop, roleMineLink, roleRepair, roleUpgrade } from "../roles/_index.ts";

interface RoleFunction {
	(this: Creep): ScreepsReturnCode;
}

const roles: Record<string, RoleFunction> = {
	build: roleBuild.run as RoleFunction,
	explore: roleExplore.run as RoleFunction,
	haul: roleHaul.run as RoleFunction,
	manage: roleManage.run as RoleFunction,
	"mine-drop": roleMineDrop.run as RoleFunction,
	"mine-link": roleMineLink.run as RoleFunction,
	repair: roleRepair.run as RoleFunction,
	upgrade: roleUpgrade.run as RoleFunction,
};

export function manageCreep(creep: Creep) {
	if (creep.spawning) {
		return;
	}

	const { role } =  creep.decodeName()
	if (role in roles) {
		roles[role].call(creep);
	} else {
		throw new NotImplementedError(`${creep} role ${role}`);
	}
}

import { UnreachableError } from "util";
import { roleExplore, roleManage } from "../roles/_index.ts";

export function manageCreep(creep: Creep) {
	switch (creep.memory.role) {
		case "explore":
			roleExplore.call(creep as Creep.Roles.ExploreCreep);
			break;
		case "manage":
			roleManage.call(creep as Creep.Roles.ManageCreep);
			break;
		default:
			throw new UnreachableError(`${creep}.memory.role = ${creep.memory.role}`);
	}
}

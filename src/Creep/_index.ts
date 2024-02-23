import "./prototype.ts";
import "./Actions/_index.ts";
import { UnreachableError } from "Utils";
import {
	type CreepRole,
	RoleAttack,
	RoleBuild,
	RoleClaim,
	RoleExplore,
	RoleHaul,
	RoleHeal,
	RoleMine,
	RoleRepair,
	RoleReserve,
	RoleUpgrade,
} from "./Roles/_index.ts";

export interface ActionCreepMemory extends CreepMemory {
	_actionSteps: Array<unknown>;
}

export interface ActionCreep extends Creep {
	memory: ActionCreepMemory;
}

const roles: { [_ in string]: CreepRole } = {
	[RoleAttack.RoleName]: RoleAttack,
	[RoleBuild.RoleName]: RoleBuild,
	[RoleClaim.RoleName]: RoleClaim,
	[RoleExplore.RoleName]: RoleExplore,
	[RoleHaul.RoleName]: RoleHaul,
	[RoleHeal.RoleName]: RoleHeal,
	[RoleMine.RoleName]: RoleMine,
	[RoleRepair.RoleName]: RoleRepair,
	[RoleReserve.RoleName]: RoleReserve,
	[RoleUpgrade.RoleName]: RoleUpgrade,
};

export function creepHandler(creep: Creep) {
	if (!((creep as ActionCreep).memory._actionSteps?.length !== 0)) {
		const { role } = creep.decodeName();

		if (role in roles) {
			(creep as ActionCreep).memory._actionSteps = roles[role].getActions(creep);
		} else {
			throw new UnreachableError(`${creep}.role = ${role}`);
		}
	}


}

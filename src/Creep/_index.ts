import "./prototypes.ts";
import { UnreachableError } from "Utils";
import { Roles } from "./Roles/_index.ts";

export * from "./events.ts";
export * from "./Roles/_index.ts";

export function creepManager(creep: Creep) {
	if (creep.memory.recycleSelf) {
		const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
		if (spawn) {
			if (spawn.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
				creep.travelTo(spawn);
				spawn.recycleCreep(creep);
			}
		} else {
			return;
		}
	}

	const { role } = creep.decodeName();
	if (role in Roles) {
		Roles[role].execute(creep as any);
	} else {
		throw new UnreachableError(`invalid role ${creep}.memory.role = "${role}"`);
	}
}

import "./prototypes.ts";
import { UnreachableError } from "Utils";
import { Roles } from "./Roles/_index.ts";

export * from "./events.ts";
export * from "./Roles/_index.ts";

export function creepManager(creep: Creep) {
	const { role } = creep.decodeName();
	if (role in Roles) {
		Roles[role].execute(creep as any);
	} else {
		throw new UnreachableError(`invalid role ${creep}.memory.role = "${role}"`);
	}
}

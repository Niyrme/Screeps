import { Logging } from "Util";

export function newAction<A extends Actions.CreepAction>(type: A["type"], args: Omit<A, "type" | "id">): A {
	Logging.debug(`new action: ${type} (#${(Memory.jobID + 1).toString(36)})`);
	return _.merge({}, args, { type, id: (Memory.jobID++).toString(36) }) as A;
}

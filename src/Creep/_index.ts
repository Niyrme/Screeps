import "./prototype.ts";
import { CodeToString, Logging, UnreachableError } from "Util";
import { actionBuild, actionGather } from "./Action/_index.ts";

export function creepHandler(creep: Creep) {
	if (!("actions" in creep.memory)) {
		// @ts-ignore
		creep.memory.actions = [];
	}

	if (creep.memory.actions.length === 0) {
		if (Game.rooms[creep.memory.home].memory.jobs.length !== 0) {
			creep.memory.actions = Game.rooms[creep.memory.home].memory.jobs.shift()!;
		} else {
			return;
		}
	}

	const [{ type: actionType }] = creep.memory.actions;
	let err: ScreepsReturnCode;
	switch (actionType) {
		case "build": {
			switch ((err = actionBuild(creep))) {
				case OK:
				case ERR_BUSY:
					break;
				case ERR_NOT_FOUND:
					creep.memory.actions.shift();
					break;
				case ERR_NOT_ENOUGH_RESOURCES:
					// TODO get new energy
					creep.memory.actions.unshift();
					break;
				case ERR_NOT_IN_RANGE:
					const site = Game.getObjectById((creep.memory.actions[0] as Actions.Build).constructionSite)!;
					creep.travelTo(site, { range: 3 });
					break;
				default:
					Logging.warning(`${creep} had unhandled error in action ${actionType}: ${CodeToString(err)}`);
					break;
			}
			break;
		}
		case "gather": {
			switch ((err = actionGather(creep))) {
				default:
					Logging.warning(`${creep} had unhandled error in action ${actionType}: ${CodeToString(err)}`);
					break;
			}
			break;
		}
		case "harvest":
		case "move":
		case "repair":
		case "transfer":
		case "upgrade":
		default:
			throw new UnreachableError(`${creep} has invalid action: ${actionType}`);
	}
}

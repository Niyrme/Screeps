import { newAction } from "./action.ts";

declare global {
	export namespace Actions {
		export interface Harvest extends Action<"harvest"> {
			readonly source: Id<Source>;
		}
	}
}

export function actionHarvest(creep: Creep): ScreepsReturnCode {
	const [{ source: sourceID }] = creep.memory.actions as Actions.Specific<Actions.Harvest>;

	const source = Game.getObjectById(sourceID);
	if (source) {
		return creep.harvest(source);
	} else {
		return ERR_NOT_FOUND;
	}
}

export namespace actionHarvest {
	export function create(creep: Creep): null | Actions.Harvest {
		if (!(creep.memory.home in Game.rooms)) { return null; }
		const room = Game.rooms[creep.memory.home];
		let source: null | Id<Source> = null;
		for (const sourceID of Object.keys(room.memory.resources.energy)) {
			if (!room.memory.resources.energy[sourceID].miner) {
				source = Game.getObjectById(sourceID)!.id;
				break;
			}
		}

		if (source) {
			return newAction<Actions.Harvest>("harvest", {
				source,
			});
		} else {
			return null;
		}
	}
}

import { newAction } from "./action.ts";

declare global {
	export namespace Actions {
		export interface Repair extends Action<"repair"> {
			readonly structure: Id<AnyStructure>;
		}
	}
}

export function actionRepair(creep: Creep): ScreepsReturnCode {
	const [{ structure: structureID }] = creep.memory.actions as Actions.Specific<Actions.Repair>;

	const structure = Game.getObjectById(structureID);
	if (structure) {
		if (structure.hits < structure.hitsMax) {
			return creep.repair(structure);
		} else {
			return ERR_INVALID_TARGET;
		}
	} else {
		return ERR_NOT_FOUND;
	}
}

export namespace actionRepair {
	export function create(creep: Creep, structure: AnyStructure): null | Actions.Repair {
		if (structure.hits < structure.hitsMax) {
			return newAction<Actions.Repair>("repair", {
				structure: structure.id,
			});
		} else {
			return null;
		}
	}
}

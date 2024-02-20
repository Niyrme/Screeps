declare global {
	export namespace Actions {
		export interface Transfer extends Action<"transfer"> {
			readonly dest: Id<AnyStoreStructure>;
			readonly amount?: number;
			readonly resourceType: ResourceConstant;
		}
	}
}

export function actionTransfer(creep: Creep): ScreepsReturnCode {
	const [{ dest, amount, resourceType }] = creep.memory.actions as Actions.Specific<Actions.Transfer>;

	const structure = Game.getObjectById(dest);
	if (structure) {
		return creep.transfer(structure, resourceType, amount);
	} else {
		return ERR_NOT_FOUND;
	}
}

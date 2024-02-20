declare global {
	export namespace Actions {
		export interface Move extends Action<"move"> {
			readonly dest: RoomPosition;
		}
	}
}

export function actionMove(creep: Creep): ScreepsReturnCode {
	const [{ dest }] = creep.memory.actions as Actions.Specific<Actions.Move>;
	return creep.travelTo(dest);
}

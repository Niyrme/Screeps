import { newAction } from "./action.ts";

declare global {
	export namespace Actions {
		export interface Upgrade extends Action<"upgrade"> {
			readonly controller: Id<StructureController>;
		}
	}
}

export function actionUpgrade(creep: Creep): ScreepsReturnCode {
	const [{ controller: controllerID }] = creep.memory.actions as Actions.Specific<Actions.Upgrade>;

	const controller = Game.getObjectById(controllerID);
	if (controller) {
		return creep.upgradeController(controller);
	} else {
		return ERR_NOT_FOUND;
	}
}

export namespace actionUpgrade {
	export function create(creep: Creep, controller?: StructureController): null | Actions.Upgrade {
		if (controller) {
			return newAction<Actions.Upgrade>("upgrade", {
				controller: controller.id,
			});
		} else {
			if (!(creep.memory.home in Game.rooms)) { return null; }

			const room = Game.rooms[creep.memory.home];
			if (room.controller?.my) {
				return newAction<Actions.Upgrade>("upgrade", {
					controller: room.controller.id,
				});
			} else {
				return null;
			}
		}
	}
}

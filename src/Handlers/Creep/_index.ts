import { type CreepAction, CreepActionQueue, type CreepActionType } from "../../Prototypes/Creep.ts";
import { NotImplementedError, UnreachableError } from "../../Utils/_index.ts";
import { CreepActionCode, HarvestAction, UpgradeAction } from "./actions/_index.ts";

const actionMap = new Map<CreepAction["type"], CreepActionType>([
	["harvest", HarvestAction],
	["upgrade", UpgradeAction],
]);

export default function handleCreep(creep: Creep): void {
	if (!Creep.actions.has(creep.id)) {
		Creep.actions.set(creep.id, new CreepActionQueue());
	}

	const actions = Creep.actions.get(creep.id)!;
	if (actions.empty) {
		// TODO add actions
		throw new NotImplementedError("creep actions empty");
	}

	const actionType = actions.head!;
	const actionConstructor = actionMap.get(actionType);
	if (!actionConstructor) {
		throw new UnreachableError(`invalid action ${actionType}`);
	}

	const action = new actionConstructor(creep);

	const r = action.execute();
	switch (r) {
		case CreepActionCode.Error:
			return;
		case CreepActionCode.Next:
			actions.pop();
			break;
	}
}

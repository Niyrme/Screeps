import { UnreachableError } from "Util";

declare global {
	export namespace Actions {
		export namespace Gather {
			interface GatherSource<Type extends string> {
				readonly type: Type;
			}

			interface Pickup extends GatherSource<"pickup"> {
				readonly resource: Id<Resource>;
			}

			interface Withdraw extends GatherSource<"withdraw"> {
				readonly structure: Id<AnyStoreStructure>;
				readonly amount?: number;
				readonly resourceType?: ResourceConstant;
			}

			export type Source =
				| Pickup
				| Withdraw
		}

		export interface Gather extends Action<"gather"> {
			readonly source: Gather.Source;
		}
	}
}

export function actionGather(creep: Creep): ScreepsReturnCode {
	const [{ source }] = creep.memory.actions as Actions.Specific<Actions.Gather>;

	switch (source.type) {
		case "pickup":
			const resource = Game.getObjectById(source.resource);
			if (resource) {
				return creep.pickup(resource);
			} else {
				return ERR_NOT_FOUND;
			}
		case "withdraw":
			const structure = Game.getObjectById(source.structure);
			if (structure) {
				return creep.withdraw(structure, source.resourceType ?? RESOURCE_ENERGY, source.amount);
			} else {
				return ERR_NOT_FOUND;
			}
		default:
			throw new UnreachableError(`actionGather(${creep}).source.type`);
	}
}

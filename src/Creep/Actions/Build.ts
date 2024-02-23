import type { ActionCreep } from "./types";

export namespace ActionBuild {
	interface Step {
		readonly constructionSite: Id<ConstructionSite>;
	}

	export function execute(creep: ActionCreep): ScreepsReturnCode {
		const { constructionSite } = creep.memory._actionSteps[0] as Step;

		const site = Game.getObjectById(constructionSite);
		if (site) {
			return creep.build(site);
		} else {
			return ERR_NOT_FOUND;
		}
	}
}

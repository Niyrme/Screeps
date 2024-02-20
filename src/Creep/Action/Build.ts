declare global {
	export namespace Actions {
		export interface Build extends Action<"build"> {
			readonly constructionSite: Id<ConstructionSite>;
		}
	}
}

export function actionBuild(creep: Creep): ScreepsReturnCode {
	const [{ constructionSite }] = creep.memory.actions as Actions.Specific<Actions.Build>;

	const site = Game.getObjectById(constructionSite);
	if (site) {
		return creep.build(site);
	} else {
		return ERR_NOT_FOUND;
	}
}

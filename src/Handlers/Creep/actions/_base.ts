export interface ActionJSON<Type> {
	type: Type;
	creep: Id<Creep>;
}

export const enum CreepActionCode {
	Error = -1,
	Ok = 0,
	Next = 1,
}

export abstract class BaseAction<Type extends string, ActionData extends Record<any, any>, C extends Creep = Creep> {
	public abstract readonly type: Type;
	protected creep: C & { memory: C["memory"] & { actionData: C["memory"]["actionData"] & ActionData } };

	constructor(creep: C) {
		this.creep = creep as typeof this.creep;
	}

	abstract execute(): CreepActionCode

	toJSON(): ActionJSON<Type> {
		return {
			type: this.type,
			creep: this.creep.id,
		}
	}
}

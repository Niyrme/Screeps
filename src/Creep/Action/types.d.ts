declare global {
	export namespace Actions {
		export interface Action<Type extends string> {
			readonly type: Type;
			readonly id: string;
		}

		export type CreepAction =
			| Actions.Build
			| Actions.Gather
			| Actions.Harvest
			| Actions.Move
			| Actions.Repair
			| Actions.Transfer
			| Actions.Upgrade

		export type Specific<Action extends CreepAction> = CreepMemory["actions"] & { 0: Action }
	}
}

export {};

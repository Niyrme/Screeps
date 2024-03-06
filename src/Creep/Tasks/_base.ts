export interface Task<Type extends string> {
	type: Type;
	create(): this;
	execute(creep: Creep): ScreepsReturnCode;
}

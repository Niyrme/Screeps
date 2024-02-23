export interface ActionCreepMemory extends CreepMemory {
	_actionSteps: Array<unknown>;
}

export interface ActionCreep extends Creep {
	memory: ActionCreepMemory;
}

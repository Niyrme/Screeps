import { NotImplementedError } from "Utils";
import type { ActionCreep } from "./types";

export namespace ActionReserve {
	interface Step {}

	export function execute(creep: ActionCreep): ScreepsReturnCode {
		const {} = creep.memory._actionSteps[0] as Step;
		throw new NotImplementedError(`ActionReserve.execute(${creep})`);
	}
}

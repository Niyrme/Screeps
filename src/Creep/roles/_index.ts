export { roleBuild } from "./build.ts";
export { roleExplore } from "./explore.ts";
export { roleHaul } from "./haul.ts";
export { roleManage } from "./manage.ts";
export { roleMineDrop } from "./mine-drop.ts";
export { roleMineLink } from "./mine-link.ts";
export { roleRepair } from "./repair.ts";
export { roleUpgrade } from "./upgrade.ts";

declare global {
	export namespace Roles {
		export interface Role<C extends Creep> {
			spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType;

			run(this: C): ScreepsReturnCode;
		}
	}
}

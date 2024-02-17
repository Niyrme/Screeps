export * from "./build.ts";
export * from "./explore.ts";
export * from "./harvest.ts";
export * from "./haul.ts";
export * from "./manage.ts";
export * from "./mine-drop.ts";
export * from "./mine-link.ts";
export * from "./repair.ts";
export * from "./upgrade.ts";

declare global {
	export namespace Roles {
		export interface Role<C extends Creep> {
			spawn: Function;

			run(this: C): ScreepsReturnCode;
		}
	}
}

import type { RoleBuild, RoleHarvest, RoleMine, RoleRepair, RoleUpgrade } from "./_all.ts";

export interface Role<R extends string, C extends Creep> {
	name: R;

	execute(creep: C): void;
}

export type Stages<C extends Creep> = Array<(creep: C) => void>

type AnyRole =
	| RoleBuild
	| RoleHarvest
	| RoleMine
	| RoleRepair
	| RoleUpgrade

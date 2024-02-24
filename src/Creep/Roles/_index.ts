import { RoleAttack } from "./Attack.ts";
import { RoleBuild } from "./Build.ts";
import { RoleClaim } from "./Claim.ts";
import { RoleExplore } from "./Explore.ts";
import { RoleHarvest } from "./Harvest.ts";
import { RoleHaul } from "./Haul.ts";
import { RoleHeal } from "./Heal.ts";
import { RoleMine } from "./Mine.ts";
import { RoleRepair } from "./Repair.ts";
import { RoleReserve } from "./Reserve.ts";
import { RoleUpgrade } from "./Upgrade.ts";

export const Roles: AllRoles = {
	[RoleAttack.NAME]: RoleAttack,
	[RoleBuild.NAME]: RoleBuild,
	[RoleClaim.NAME]: RoleClaim,
	[RoleExplore.NAME]: RoleExplore,
	[RoleHarvest.NAME]: RoleHarvest,
	[RoleHaul.NAME]: RoleHaul,
	[RoleHeal.NAME]: RoleHeal,
	[RoleMine.NAME]: RoleMine,
	[RoleRepair.NAME]: RoleRepair,
	[RoleReserve.NAME]: RoleReserve,
	[RoleUpgrade.NAME]: RoleUpgrade,
};

export {
	RoleAttack,
	RoleBuild,
	RoleClaim,
	RoleExplore,
	RoleHarvest,
	RoleHaul,
	RoleHeal,
	RoleMine,
	RoleRepair,
	RoleReserve,
	RoleUpgrade,
};

import { RoleAttack } from "./Attack.ts";
import { RoleBuild } from "./Build.ts";
import { RoleClaim } from "./Claim.ts";
import { RoleDefend } from "./Defend.ts";
import { RoleExplore } from "./Explore.ts";
import { RoleExtract } from "./Extract.ts";
import { RoleHarvest } from "./Harvest.ts";
import { RoleHaul } from "./Haul.ts";
import { RoleHeal } from "./Heal.ts";
import { RoleManage } from "./Manage.ts";
import { RoleMine } from "./Mine.ts";
import { RoleRepair } from "./Repair.ts";
import { RoleReserve } from "./Reserve.ts";
import { RoleUpgrade } from "./Upgrade.ts";

export const Roles: AllRoles = {
	[RoleAttack.NAME]: RoleAttack,
	[RoleBuild.NAME]: RoleBuild,
	[RoleClaim.NAME]: RoleClaim,
	[RoleDefend.NAME]: RoleDefend,
	[RoleExplore.NAME]: RoleExplore,
	[RoleExtract.NAME]: RoleExtract,
	[RoleHarvest.NAME]: RoleHarvest,
	[RoleHaul.NAME]: RoleHaul,
	[RoleHeal.NAME]: RoleHeal,
	[RoleManage.NAME]: RoleManage,
	[RoleMine.NAME]: RoleMine,
	[RoleRepair.NAME]: RoleRepair,
	[RoleReserve.NAME]: RoleReserve,
	[RoleUpgrade.NAME]: RoleUpgrade,
};

export {
	RoleAttack,
	RoleBuild,
	RoleClaim,
	RoleDefend,
	RoleExplore,
	RoleExtract,
	RoleHarvest,
	RoleHaul,
	RoleHeal,
	RoleManage,
	RoleMine,
	RoleRepair,
	RoleReserve,
	RoleUpgrade,
};

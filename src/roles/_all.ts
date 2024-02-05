import roleBuild from "./build.ts";
import roleHarvest from "./harvest.ts";
import roleMine from "./mine.ts";
import roleRepair from "./repair.ts";
import roleUpgrade from "./upgrade.ts";

export * from "./build.ts";
export * from "./harvest.ts";
export * from "./mine.ts";
export * from "./repair.ts";
export * from "./upgrade.ts";

export const Roles = {
	[roleBuild.name]: roleBuild.execute,
	[roleHarvest.name]: roleHarvest.execute,
	[roleMine.name]: roleMine.execute,
	[roleRepair.name]: roleRepair.execute,
	[roleUpgrade.name]: roleUpgrade.execute,
};

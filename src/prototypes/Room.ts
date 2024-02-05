import roleBuild from "../roles/build.ts";
import roleHarvest from "../roles/harvest.ts";
import roleRepair from "../roles/repair.ts";
import type { AnyRole } from "../roles/types";
import roleUpgrade from "../roles/upgrade.ts";

declare global {
	interface Room {
		spawnCreeps(): void;

		queueConstructionSites(): void;

		queueRepairs(): void;
	}
}

(() => {
	Room.prototype.spawnCreeps = function () {
		const creeps = this.find(FIND_MY_CREEPS);

		const spawns = this.find(FIND_MY_SPAWNS, {
			filter: s => !s.spawning,
		});

		if (creeps.length === 0) {
			for (const spawn of spawns) {
				spawn.spawnCreep([WORK, CARRY, MOVE], {
					memory: {
						role: roleHarvest.name,
						stage: 0,
					},
				});
			}
			return;
		}

		const {
			build: countBuild,
			harvest: countHarvest,
			repair: countRepair,
			upgrade: countUpgrade,
		} = creeps.reduce(
			(acc, { memory: { role } }) => {
				acc[role]++;
				return acc;
			},
			{
				build: 0,
				harvest: 0,
				mine: 0,
				repair: 0,
				upgrade: 0,
			} as Record<AnyRole["name"], number>,
		);

		const {
			minHarvest,
			minBuild,
			minUpgrade,
			minRepair,
		} = this.memory;

		const bodyCost = 300;
		const bodyTemplate: Array<BodyPartConstant> = [WORK, WORK, CARRY, MOVE];

		for (const spawn of spawns) {
			let role: null | AnyRole["name"] = null;

			if (countHarvest < minHarvest) {
				role = roleHarvest.name;
			} else if (countRepair < minRepair) {
				role = roleRepair.name;
			} else if (countUpgrade < minUpgrade) {
				role = roleUpgrade.name;
			} else if (countBuild < minBuild) {
				role = roleBuild.name;
			}

			if (role) {
				const size = Math.floor(Math.min(1, this.controller?.level ?? Infinity, this.energyCapacityAvailable / bodyCost));

				const body: Array<BodyPartConstant> = [];
				for (let i = 0; i < size; i++) {
					body.push(...bodyTemplate);
				}

				spawn.spawnCreep(body, {
					memory: {
						role,
						stage: 0,
					},
				});
			}
		}
	};

	Room.prototype.queueConstructionSites = function () {
	};

	Room.prototype.queueRepairs = function () {
	};
})();

export {};

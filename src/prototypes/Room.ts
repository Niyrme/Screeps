import roleBuild from "../roles/build.ts";
import roleHarvest from "../roles/harvest.ts";
import roleRepair from "../roles/repair.ts";
import type { AnyRole } from "../roles/types";
import roleUpgrade from "../roles/upgrade.ts";

declare global {
	interface RoomMemory {
		minBuild: number;
		minHarvest: number;
		minRepair: number;
		minUpgrade: number;
		// buildQueue: PriorityArray<Id<ConstructionSite>>;
		// repairQueue: PriorityArray<Id<AnyStructure>>;
		weakestEnemy: null | Id<Creep>;
	}

	interface Room {
		spawnCreeps(): void;

		queueConstructionSites(): void;

		queueRepairs(): void;

		defend(): void;
	}
}

(() => {
	Room.prototype.toString = function () {
		return `Room(${this.name}, ${this.controller?.level ?? 0})`;
	};

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
				const size = Math.max(1, Math.min(this.controller?.level ?? Infinity, Math.floor(this.energyCapacityAvailable / bodyCost)));

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

	Room.prototype.defend = function () {
		const targets = this.find(FIND_HOSTILE_CREEPS);
		if (targets.length === 0) {
			this.memory.weakestEnemy = null;
			return;
		}

		const towers: Array<StructureTower> = this.find(FIND_MY_STRUCTURES, {
			filter: s => s.structureType === STRUCTURE_TOWER,
		});

		if (this.memory.weakestEnemy) {
			const target = Game.getObjectById(this.memory.weakestEnemy);
			if (target) {
				for (const tower of towers) {
					tower.attack(target);
				}

				return;
			} else {
				this.memory.weakestEnemy = null;
			}
		}

		function filterWeakest(creeps: Array<Creep>): null | Creep {
			if (creeps.length === 0) {
				return null;
			} else if (creeps.length === 1) {
				return creeps[0];
			} else {
				return creeps.reduce((weakest, current) => current.hits < weakest.hits ? current : weakest);
			}
		}

		const target =
			filterWeakest(_.filter(targets, c => _.includes(c.body.map(p => p.type), HEAL)))
			|| filterWeakest(_.filter(targets, c => _.includes(c.body.map(p => p.type), RANGED_ATTACK)))
			|| filterWeakest(_.filter(targets, c => _.includes(c.body.map(p => p.type), ATTACK)));

		if (target) {
			this.memory.weakestEnemy = target.id;
			this.defend();
		}
	};
})();

export {};

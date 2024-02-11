import { getBodyCost } from "../../util.ts";
import { UnhandledError } from "../../util/errors.ts";

declare global {
	namespace Roles {
		export namespace Mine {
			export interface memory extends CreepMemory {
				readonly source: Id<Source>;
			}

			export interface creep extends Creep {
				memory: Roles.Mine.memory;
			}
		}

		export interface Mine extends Roles.CreepRole<Roles.Mine.creep> {
			spawn(spawn: StructureSpawn): ScreepsReturnCode;
		}
	}
}

export const roleMine: Roles.Mine = {
	spawn(spawn) {
		let source: null | Source = null;
		for (const sourceId of Object.keys(spawn.room.memory.resources.energy)) {
			source = Game.getObjectById(sourceId);
			if (!_.find(Game.creeps, creep => creep.memory.role === "mine" && (creep as Roles.Mine.creep).memory.source === source!.id)) {
				break;
			}
		}

		if (source) {
			const body: Array<BodyPartConstant> = [MOVE, WORK, WORK, WORK, WORK, WORK];

			while (getBodyCost(body) > spawn.room.energyCapacityAvailable) {
				body.pop();
			}

			if (body.length < 2) {
				return ERR_NOT_ENOUGH_RESOURCES;
			}

			return spawn.newCreep(body, {
				memory: {
					role: "mine",
					homeRoom: spawn.room.name,
					source: source.id,
				} as Roles.Mine.memory,
			});
		} else {
			return ERR_INVALID_TARGET;
		}
	},
	run(creep) {
		const source = Game.getObjectById(creep.memory.source)!;
		const err = creep.harvest(source);
		switch (err) {
			case OK:
			case ERR_BUSY:
			case ERR_NOT_ENOUGH_RESOURCES:
			case ERR_TIRED:
				break;
			case ERR_NOT_IN_RANGE:
				const container =
					source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType === STRUCTURE_CONTAINER }).pop() as undefined | StructureContainer
					|| source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, { filter: s => s.structureType === STRUCTURE_CONTAINER }).pop() as undefined | ConstructionSite<STRUCTURE_CONTAINER>;
				const moveErr = creep.moveTo(container || source, {
					ignoreCreeps: true,
					...(Memory.visuals ? {
						visualizePathStyle: {
							lineStyle: "solid",
							stroke: "#fff",
							opacity: 0.2,
						},
					} : {}),
				});
				switch (moveErr) {
					case OK:
						break;
				}
				break;
			default:
				throw new UnhandledError(err);
		}
	},
};

export default roleMine;

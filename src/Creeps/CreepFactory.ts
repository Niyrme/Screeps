/* eslint-disable
	@typescript-eslint/no-unsafe-member-access
*/

import {
	ROLES_ALL as Roles,
	SPAWN_CONSTANTS,
} from "Config/Constants";
import * as Template from "Config/Templates/CreepTemplates";

export class CreepFactory {

	private room: Room;
	constructor(room: Room) {
		this.room = room;
	}

	public spawnCreeps() : void {
		const creepsInRoom: Array<Creep> = this.room.find(FIND_MY_CREEPS);

		const countHarvesters = _.filter(creepsInRoom, (c) => (c.memory.role == Roles.ROLE_HARVESTER) && ((c.memory.mode == undefined) || (c.memory.target == undefined))).length;
		const countMiners = _.filter(creepsInRoom, (c) => (c.memory.role == Roles.ROLE_MINER)).length;

		if ((creepsInRoom.length == 0) || (countHarvesters == 0 && countMiners == 0)) {
			this.room.memory.spawnQueue.splice(0, 0, { template: Template.TEMPLATE_CREEP_HARVESTER, emergency: true })
		}

		Template.TEMPLATE_CREEPS.forEach(template => {
			const count: number = _.filter(creepsInRoom, (c) => (c.memory.role == template.role) && (c.memory.mode == undefined)).length;

			this.room.memory.mins.forEach(m => {
				if (m.name == template.role) {
					if (count < m.count) {
						if (template.role == Template.TEMPLATE_CREEP_MINER.role) {
							this.room.find(FIND_SOURCES).forEach(source => {
								if (!_.some(creepsInRoom, (c) => (c.memory.role == Template.TEMPLATE_CREEP_MINER.role && c.memory.sourceID == source.id))) {
									if (source.pos.findInRange(FIND_STRUCTURES, 1, { filter: (s) => s.structureType == STRUCTURE_CONTAINER }).length > 0) {
										this.room.memory.spawnQueue.push({ template, sourceId: source.id })
									}
								}
							});
						}
						else {
							this.room.memory.spawnQueue.push({ template });
						}
					}
				}
			});
		});

		if (this.room.memory.reserveRoom) {
			this.room.memory.spawnQueue.push({ template: Template.TEMPLATE_CREEP_RESERVER, target: this.room.memory.reserveRoom })
		}
		else if (this.room.memory.claimRoom) {
			this.room.memory.spawnQueue.push({ template: Template.TEMPLATE_CREEP_CLAIMER, target: this.room.memory.claimRoom })
		}

		if (this.room.memory.spawnQueue.length >= 1) {
			const templ = this.room.memory.spawnQueue[0];
			if (templ.emergency) {
				if (this.spawnTemplate(this.room.energyAvailable, templ.template, templ.sourceId, templ.target) == OK) {
					console.log(`Spawning emergency havester in ${this.room.name}`);
					this.room.memory.spawnQueue.shift();
				}
			}
			else if (this.spawnTemplate(this.room.energyCapacityAvailable, templ.template, templ.sourceId, templ.target) == OK) {
				this.room.memory.spawnQueue.shift()
			}
		}
	}

	private spawnTemplate(energy: number, template: TemplateCreep, sourceID?: Id<Source>, target?: string) {
		let creepBody: Array<BodyPartConstant> = [];
		const spawn: StructureSpawn = _.filter(this.room.find(FIND_MY_SPAWNS), (s) => (s.spawning == null))[0];
		if (!spawn) { return ERR_BUSY; }
		const timestamp: string = `${Game.time}`.slice(-8);
		// eslint-disable-next-line @typescript-eslint/no-inferrable-types, @typescript-eslint/restrict-template-expressions
		const creepName: string = `${template.role} - ${Memory.randomData.player} (${timestamp})`;
		let creepMaxSize: number = MAX_CREEP_SIZE;

		if (template.bodyType == SPAWN_CONSTANTS.MODE_MULTI) {
			let partsNumber: number = Math.floor(energy / 200);

			if (this.room.memory.creepMaxParts != undefined) {
				creepMaxSize = this.room.memory.creepMaxParts;
			}

			if (partsNumber * template.body.length > creepMaxSize) {
				partsNumber = Math.floor(creepMaxSize / template.body.length);
			}
			template.body.forEach(part => {
				for (let i = 0; i < partsNumber; i++) {
					creepBody.push(part);
				}
			});
		}
		else if (template.bodyType == SPAWN_CONSTANTS.MODE_SINGLE) {
			creepBody = template.body;
		}

		return spawn.spawnCreep(creepBody, creepName, {memory: {
			role: template.role,
			isWorking: false,
			mode: template.mode,
			sourceID,
			target,
		}});
	}
}

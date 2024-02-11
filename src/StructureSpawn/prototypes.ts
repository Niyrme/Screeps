import { getBodyCost } from "../util.ts";
import { ErrorcodeToString } from "../util/errors.ts";
import Logging from "../util/logging.ts";

StructureSpawn.prototype.toString = function () {
	return `StructureSpawn(${this.id}, ${this.name}, ${this.room.name})`;
};

StructureSpawn.prototype.newCreep = function (body, opts) {
	const err = this.spawnCreep(body, Memory.creepID.toString(), opts);

	Logging.debug(`${this}.newCreep = ${ErrorcodeToString(err)}; ${opts.memory.role}; ${JSON.stringify(body)}`);

	if (err === OK && !opts.dryRun) {
		Logging.info(`New Creep(${Memory.creepID}, ${opts.memory.role})`);
		Memory.creepID++;
	}

	return err;
};

StructureSpawn.prototype.spawnMaxCreep = function (baseBody, opts) {
	const bodyCost = getBodyCost(baseBody);
	const size = Math.max(1, Math.min(this.room.controller?.level ?? Infinity, Math.floor(this.room.energyCapacityAvailable / bodyCost)));
	const body: Array<BodyPartConstant> = [];
	for (let i = 0; i < size; i++) {
		body.push(...baseBody);
	}

	return this.newCreep(body, opts);
};

export {};

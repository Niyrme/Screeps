import { ErrorcodeToString, Logging } from "util";

declare global {
	export namespace RoomPosition {
		export type TryPutConstructionSiteReturnCode =
			OK
			| ERR_BUSY
			| ERR_INVALID_TARGET
			| ERR_FULL
			| ERR_INVALID_ARGS
			| ERR_RCL_NOT_ENOUGH
	}

	interface RoomPosition {
		tryPutConstructionSite(type: STRUCTURE_SPAWN, spawnName: string): RoomPosition.TryPutConstructionSiteReturnCode;

		tryPutConstructionSite(type: Exclude<BuildableStructureConstant, STRUCTURE_SPAWN>, spawnName?: never): RoomPosition.TryPutConstructionSiteReturnCode;
	}
}

RoomPosition.prototype.tryPutConstructionSite = function (type, spawnName = undefined) {
	let occupied = false;
	if (this.lookFor(LOOK_CONSTRUCTION_SITES).length !== 0) {
		occupied = true;
	}

	const structures = this.lookFor(LOOK_STRUCTURES);
	if (structures.filter(s => s.structureType === STRUCTURE_RAMPART).length !== 0) {
		occupied ||= type === STRUCTURE_RAMPART;
	} else if (structures.filter(({ structureType: s }) => s !== STRUCTURE_ROAD).length !== 0) {
		occupied ||= type === STRUCTURE_ROAD;
	} else {
		occupied ||= structures.length !== 0;
	}

	if (!occupied) {
		const err = (
			type === STRUCTURE_SPAWN
				? this.createConstructionSite(type, spawnName)
				: this.createConstructionSite(type)
		) as OK | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;

		switch (err) {
			case OK:
			case ERR_FULL:
				break;
			default:
				Logging.error(`could not place ${type} at ${this}: ${ErrorcodeToString(err)}`);
				break;
		}

		return err;
	} else {
		return ERR_BUSY;
	}
};

export {};

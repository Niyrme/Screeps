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
	let occupied = this.lookFor(LOOK_CONSTRUCTION_SITES).length !== 0;

	if (!occupied) {
		const structures = this.lookFor(LOOK_STRUCTURES);
		if (structures.length !== 0) {
			switch (type) {
				case STRUCTURE_RAMPART:
					occupied ||= structures.filter(({ structureType: t }) => t === STRUCTURE_RAMPART).length !== 0;
					break;
				case STRUCTURE_ROAD:
					occupied ||= structures.filter(({ structureType: t }) => t === STRUCTURE_ROAD).length !== 0;
					break;
				default:
					occupied ||= structures.filter(({ structureType: t }) => !(
						t === STRUCTURE_RAMPART || t === STRUCTURE_ROAD
					)).length !== 0;
					break;
			}
		}
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

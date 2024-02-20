import { CodeToString, Logging } from "Util";

declare global {
	export namespace RoomPosition {
		export type TryCreateConstructionSiteReturnCode =
			| OK
			| ERR_BUSY
			| ERR_INVALID_TARGET
			| ERR_FULL
			| ERR_INVALID_ARGS
			| ERR_RCL_NOT_ENOUGH
	}

	interface RoomPosition {
		tryCreateConstructionSite(type: STRUCTURE_SPAWN, spawnName: string): RoomPosition.TryCreateConstructionSiteReturnCode;

		tryCreateConstructionSite(type: Exclude<BuildableStructureConstant, STRUCTURE_SPAWN>, spawnName?: never): RoomPosition.TryCreateConstructionSiteReturnCode;
	}
}

RoomPosition.prototype.tryCreateConstructionSite = function (type, spawnName = undefined) {
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
				Logging.error(`could not place ${type} at ${this}: ${CodeToString(err)}`);
				break;
		}

		return err;
	} else {
		return ERR_BUSY;
	}
};

export {};

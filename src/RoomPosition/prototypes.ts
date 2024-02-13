import { ErrorcodeToString, Logging } from "util";

declare global {
	interface RoomPosition {
		tryPutConstructionSite(type: STRUCTURE_SPAWN, spawnName: string): OK | ERR_BUSY | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;

		tryPutConstructionSite(type: Exclude<BuildableStructureConstant, STRUCTURE_SPAWN>, spawnName?: never): OK | ERR_BUSY | ERR_INVALID_TARGET | ERR_FULL | ERR_INVALID_ARGS | ERR_RCL_NOT_ENOUGH;
	}
}

RoomPosition.prototype.tryPutConstructionSite = function (type, spawnName = undefined) {
	const occupied = this.look()
		.filter(res => {
			if (!!res.constructionSite) {
				return false;
			}

			if (!res.structure) {
				return true;
			} else {
				return res.structure.structureType === STRUCTURE_RAMPART || res.structure.structureType === STRUCTURE_ROAD;
			}
		});

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

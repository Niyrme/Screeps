import { CodeToString, Logging } from "Utils";

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
		findFarthestByRange<F extends FindConstant, S extends FindTypes[F]>(
			type: F,
			opts?: FilterOptions<F, S>,
		): null | S;
		findFarthestByRange<S extends AnyStructure>(
			type: FIND_STRUCTURES | FIND_MY_STRUCTURES | FIND_HOSTILE_STRUCTURES,
			opts?: FilterOptions<FIND_STRUCTURES, S>,
		): null | S;
		findFarthestByRange<P extends _HasRoomPosition | RoomPosition>(
			objects: Array<P>,
			opts?: { filter: any | string },
		): null | P;

		tryCreateConstructionSite(type: STRUCTURE_SPAWN, spawnName: string): RoomPosition.TryCreateConstructionSiteReturnCode;
		tryCreateConstructionSite(type: Exclude<BuildableStructureConstant, STRUCTURE_SPAWN>, spawnName?: never): RoomPosition.TryCreateConstructionSiteReturnCode;
	}
}

RoomPosition.prototype.findFarthestByRange = function <F extends FindConstant, S extends FindTypes[F]>(
	type: F | Array<_HasRoomPosition | RoomPosition>,
	opts: FilterOptions<F, S> | { filter: any | string },
): null | S | (_HasRoomPosition | RoomPosition) {
	const room = Game.rooms[this.roomName];
	opts = _.clone(opts || {});

	let objects: Array<S | _HasRoomPosition | RoomPosition> = [];
	if (_.isNumber(type)) {
		objects = room.find(type, opts);
	} else if (_.isArray(type)) {
		objects = opts.filter ? _.filter(type, opts.filter) : type;
	}

	switch (objects.length) {
		case 0:
			return null;
		case 1:
			return objects[0];
		default: {
			let maxRange = -Infinity;
			let object: S | _HasRoomPosition | RoomPosition;
			objects.forEach(obj => {
				const range = this.getRangeTo(obj);
				if (range > maxRange) {
					maxRange = range;
					object = obj;
				}
			});
			return object!;
		}
	}
};

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

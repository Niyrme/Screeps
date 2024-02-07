import { UnhandledError } from "../util/errors.ts";
import Logging from "../util/logging.ts";

declare global {
	interface Creep {
		_moveTo: Creep["moveTo"];

		gatherEnergy(amount?: number): void;
	}
}

(() => {
	Creep.prototype.toString = function () {
		return `Creep(${this.name}, ${this.memory.role})`;
	};

	if (!Creep.prototype._moveTo) {
		Creep.prototype._moveTo = Creep.prototype.moveTo;

		// @ts-ignore
		Creep.prototype.moveTo = function () {
			if (Memory.visuals) {
				if (typeof arguments[0] === "number") {
					const [x, y] = arguments as unknown as [number, number, undefined | MoveToOpts];
					this.room.visual.line(this.pos.x, this.pos.y, x, y);
				} else {
					const [target] = arguments as unknown as [RoomPosition | _HasRoomPosition, undefined | MoveToOpts];
					let targetPos: RoomPosition;
					if ("pos" in target) {
						targetPos = target.pos;
					} else {
						targetPos = target;
					}
					this.room.visual.line(this.pos, targetPos);
				}
			}

			return this._moveTo.apply(this, arguments as unknown as Parameters<(typeof this)["_moveTo"]>);
		};
	}

	Creep.prototype.gatherEnergy = function (amount = undefined) {
		const storage: null | StructureStorage | StructureContainer | StructureLink = this.pos.findClosestByPath(FIND_STRUCTURES, {
			filter(s) {
				switch (s.structureType) {
					case STRUCTURE_STORAGE:
					case STRUCTURE_LINK:
						if (!s.my) {
							return;
						}
						break;
					case STRUCTURE_CONTAINER:
						break;
					default:
						return false;
				}

				return s.store.getUsedCapacity(RESOURCE_ENERGY) !== 0;
			},
		});

		if (storage) {
			const err = this.withdraw(storage, RESOURCE_ENERGY);
			switch (err) {
				case OK:
				case ERR_BUSY:
					break;
				case ERR_NOT_IN_RANGE:
					this.moveTo(storage);
					break;
				default:
					UnhandledError(err, `${this}.withdraw`);
					break;
			}
			return;
		}

		const source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
			filter: s => s.pos.findInRange(FIND_MY_CREEPS, 1, {
				filter: c => c.memory.role === "mine",
			}).length === 0,
		});

		if (source) {
			const err = this.harvest(source);
			switch (err) {
				case OK:
				case ERR_BUSY:
					break;
				case ERR_NOT_IN_RANGE:
					this.moveTo(source);
					break;
				default:
					UnhandledError(err, `${this}.harvest in Creep.gatherEnergy`);
					break;
			}

			return;
		}

		Logging.warning(`${this}.gatherEnergy no energy source found`);
	};

	Creep.prototype.gatherEnergy.prototype.toString = function () {
		return "gatherEnergy()";
	};
})();

export {};

import { NotImplementedError } from "Utils";

interface TravelOptions {
}

declare global {
	interface Creep {
		travel(destination: RoomPosition | _HasRoomPosition, options: TravelOptions): ScreepsReturnCode;
	}
}

Creep.prototype.travel = function (destination, options) {
	throw new NotImplementedError(`${this}.travel`)
}

export {};

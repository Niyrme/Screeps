import "./prototype.ts";

export class RoomHandler {
	protected memory: RoomMemory;

	constructor(protected room: Room) {
		this.memory = room.memory;
	}

	public execute() {
	}

	private construction() {
	}
}

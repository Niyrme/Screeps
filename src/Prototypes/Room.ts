import PriorityQueue from "../Lib/priority-queue.ts";

declare global {
	interface RoomMemory {}

	interface Room {
		spawnQueue: SpawnQueue;
	}

	interface RoomConstructor {}
}

interface SpawnQueueItem {
	name?: string;
	body: Array<BodyPartConstant>;
	opts: PartialRequired<Omit<SpawnOptions, "dryRun">, "memory">;
}

class SpawnQueue extends PriorityQueue<SpawnQueueItem> {
	popIfOk(fn: (item: SpawnQueueItem) => ScreepsReturnCode): null | SpawnQueueItem {
		const item = this.head;
		if (!item) { return null; }

		if (fn(item) === OK) {
			return this.pop()!;
		} else {
			return null;
		}
	}
}

Room.prototype.spawnQueue = new SpawnQueue();

export {};

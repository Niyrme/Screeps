export namespace PriorityQueue {
	export type QueueItem<T> = [number, T]
	export type Queue<T> = Array<QueueItem<T>>
}

export function PriorityQueue<T>(array: PriorityQueue.Queue<T>) {
	return {
		push(value: T, priority: number): void {
			const item: PriorityQueue.QueueItem<T> = [priority, value];

			if (array.length === 0) {
				array.push(item);
			} else if (array.length === 1) {
				if (priority < array[0][0]) {
					array.unshift(item);
				} else {
					array.push(item);
				}
			} else {
				if (priority < array[0][0]) {
					array.unshift(item);
				} else if (priority > array[array.length - 1][0]) {
					array.push(item);
				} else {
					for (let idx = array.length - 1; idx >= 0; idx--) {
						if (!(priority < array[idx][0])) {
							array.splice(idx + 1, 0, item);
						}
					}
				}
			}
		},
		pop(): null | T {
			if (array.length === 0) {
				return null;
			} else {
				return array.shift()![1];
			}
		},
	};
}

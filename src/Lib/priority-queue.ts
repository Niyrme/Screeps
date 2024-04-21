type PriorityQueueValue<T> = [value: T, priority: number]

export class PriorityQueue<T> {
	protected data: Array<PriorityQueueValue<T>>;

	/**
	 * @param init initial data
	 * @param compareFn
	 *    comparison function used for sorting ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#comparefn)).
	 *    default is sorting by priorty, higher first
	 */
	constructor(
		init: Array<PriorityQueueValue<T>> = [],
		protected compareFn: (a: PriorityQueueValue<T>, b: PriorityQueueValue<T>) => number = ([, a], [, b]) => b - a,
	) {
		this.data = init;
	}

	/**
	 * get number of items in queue
	 */
	public get size(): number {
		return this.data.length;
	}

	/**
	 * whether the queue is empty
	 */
	public get empty(): boolean {
		return !this.data.length;
	}

	/**
	 * peek at the first item in the queue without removing it (if it exists)
	 * @returns the first item or `null` if empty
	 */
	public get head(): null | T {
		if (this.empty) {
			return null;
		} else {
			return this.data[0][0];
		}
	}

	/**
	 * take the first item
	 * @returns the first item or `null`
	 */
	public pop(): null | T {
		if (this.empty) {
			return null;
		} else {
			return this.data.shift()![0];
		}
	}

	/**
	 * take the first min(`size`, `n`) items
	 * @param amount number of items to take, must be 1 or greater
	 * @returns array containing min(`size`, `n`) items from the queue
	 */
	public take(amount: number): Array<T> {
		if (amount < 1) {
			throw new Error(`cannot take ${amount} items. must be 1 or greater`);
		} else if (this.empty) {
			return [];
		} else {
			return this.data.splice(0, amount).map(([v]) => v);
		}
	}

	/**
	 * add a new value
	 *
	 * @param value
	 * @param priority priority of the value, higher comes first
	 * @returns {number} number of items in queue
	 */
	public push(value: T, priority: number): number {
		this.data.push([value, priority]);
		return this.data.sort(this.compareFn).length;
	}

	/**
	 * add multiple values
	 *
	 * @param values
	 * @returns {number} number of items in queue
	 */
	public shove(...values: Array<[value: T, priority: number]>): number {
		this.data.push(...values);
		return this.data.sort(this.compareFn).length;
	}

	/**
	 * clear queue
	 */
	public clear() {
		this.data = [];
	}
}

export default PriorityQueue;

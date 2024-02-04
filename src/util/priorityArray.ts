export type PriorityArrayValue<T extends Object> = T & { priority: number }
export type PriorityArray<T extends Object> = Array<PriorityArrayValue<T>>

export const PriorityArray = (<T extends Object>() => {
	function add(arr: PriorityArray<T>, value: PriorityArrayValue<T>): void {
		arr.unshift(value);
		arr.sort(({ priority: a }, { priority: b }) => Number(a > b) - Number(a < b));
	}

	return {
		add,
	};
})();

export default PriorityArray;

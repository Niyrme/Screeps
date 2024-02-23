function PriorityQueue(array) {
	return {
		push(value, priority) {
			console.log(`value=${value}; priority=${priority}`);
			const item = [
				priority,
				value,
			];
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
					console.log("splice");
					for (let i = array.length - 1; i >= 0; i--) {
						console.log(`i=${i}; value=${array[i]}; less=${priority < array[i][0]}`);
						if (!(priority < array[i][0])) {
							console.log("found");
							array.splice(i + 1, 0, item);
							break;
						}
					}
				}
			}
		},
		pop() {
			if (array.length === 0) {
				return null;
			} else {
				return array.shift()[1];
			}
		},
	};
}

module.exports = {
	PriorityQueue,
};

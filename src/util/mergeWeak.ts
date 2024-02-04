export function mergeWeak(object: Record<string, any>, merge: Record<string, any>): Record<string, any> {
	for (const key of Object.keys(merge)) {
		if (key in object) {
			if (Array.isArray(object[key]) && Array.isArray(merge[key])) {
				object[key].push(...merge[key]);
			} else if (_.isPlainObject(object[key]) && _.isPlainObject(merge[key])) {
				mergeWeak(object[key], merge[key]);
			}
		} else {
			object[key] = merge[key];
		}
	}

	return object;
}

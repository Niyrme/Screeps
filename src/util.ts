export function getBodyCost(body: Array<BodyPartConstant>) {
	return body.reduce((acc, part) => acc + BODYPART_COST[part], 0);
}

export function mergeWeak(object: Record<keyof any, any>, merge: Record<keyof any, any>): Record<keyof any, any> {
	for (const key of Object.keys(merge)) {
		if (key in object) {
			if (Array.isArray(object[key]) && Array.isArray(merge[key])) {
				(object[key] as Array<unknown>).push(...merge[key] as Array<unknown>);
			} else if (_.isPlainObject(object[key]) && _.isPlainObject(merge[key])) {
				mergeWeak(object[key] as Record<keyof any, unknown>, merge[key] as Record<keyof any, unknown>);
			}
		} else {
			object[key] = merge[key];
		}
	}

	return object;
}

export * from "./Errors.ts";
export * from "./Logging.ts";

namespace mergeWeak {
	export type Object = Record<keyof any, unknown>
}

export function mergeWeak(object: mergeWeak.Object, merge: mergeWeak.Object): mergeWeak.Object {
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

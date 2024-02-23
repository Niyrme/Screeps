export function registerRole(name: string) {
	if (!Memory.roleMap) {
		// @ts-ignore
		Memory["roleMap"] = {};
	}

	if (!_.includes(Memory.roleMap, name)) {
		const key = Math.max(0, ...Object.keys(Memory.roleMap)) + 1;
		Memory.roleMap[key] = name;
	}
}

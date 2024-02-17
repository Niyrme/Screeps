export function registerRole(name: string) {
	if (!_.includes(Memory.roleMap, name)) {
		const key = Math.max(...Object.keys(Memory.roleMap)) + 1;
		Memory.roleMap[key] = name;
	}
}

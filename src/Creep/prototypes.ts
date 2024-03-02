import { UnreachableError } from "Utils";

declare global {
	interface CreepName {
		spawnTime: number;
		role: keyof AllRoles;
	}

	interface CreepMemory {
		readonly home: Room["name"];
		recycleSelf: boolean;
	}

	interface Creep {
		decodeName(): CreepName;

		dumpAllResources(dest: StructureStorage | StructureContainer): ScreepsReturnCode;
	}

	interface CreepConstructor {
		encodeName(name: CreepName): string;
		getBodyCost(body: Array<BodyPartConstant>): number;
	}
}

Creep.encodeName = ({ spawnTime, role }) => `${spawnTime.toString(36)}/` + [
	parseInt(_.findKey(Memory.roleMap, name => name === role)),
].map((v: any) => (typeof v === "number") ? v.toString(36) : v).join("-");

Creep.getBodyCost = body => body.reduce((cost, part) => cost + BODYPART_COST[part], 0);

Creep.prototype.toString = function () {
	return `Creep(${this.name}, ${this.room.name})`;
};

Creep.prototype.decodeName = function () {
	const [, time, roleID] = /^([a-z0-9]+)[\/|]([a-z0-9]+)/.exec(this.name)!;

	return {
		spawnTime: parseInt(time, 36),
		role: Memory.roleMap[parseInt(roleID, 36)],
	};
};

Creep.prototype.dumpAllResources = function (dest) {
	if (!this.store.getUsedCapacity()) {
		return ERR_NOT_ENOUGH_RESOURCES;
	}

	for (const resourceType of Object.keys(this.store) as Array<ResourceConstant>) {
		if (this.store.getUsedCapacity(resourceType)) {
			this.travelTo(dest);
			return this.transfer(dest, resourceType);
		}
	}

	throw new UnreachableError(`${this}.dumpAllResources(${dest}) store was empty`);
};

export {};

declare global {
	interface Room {
		availableResources(resource: ResourceConstant): number;
	}

	interface RoomConstructor {
	}
}

Room.prototype.availableResources = function (resource) {
	return this.find(FIND_STRUCTURES)
		.filter((s): s is Extract<typeof s, AnyStoreStructure> => "store" in s)
		.filter((s): s is Exclude<typeof s, StructureSpawn | StructureExtension | StructureTower> => {
			switch (s.structureType) {
				case STRUCTURE_SPAWN:
				case STRUCTURE_EXTENSION:
				case STRUCTURE_TOWER:
					return false;
				default:
					return "my" in s ? s.my : true;
			}
		})
		.reduce((total, structure) => total + (structure.store.getUsedCapacity(resource) ?? 0), 0);
};

export {};

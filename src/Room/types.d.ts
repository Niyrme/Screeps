export {};

declare global {
	namespace RoomMemory {
		export namespace Resources {
			export interface Energy {
			}

			export interface Mineral {
			}
		}

		export interface Resources {
			energy: { [_ in Id<Source>]: RoomMemory.Resources.Energy };
			mineral: { [_ in Id<Mineral>]: RoomMemory.Resources.Mineral };
		}
	}

	interface RoomMemory {
		resources: RoomMemory.Resources;
		attackEnemy: null | Id<Creep>;
	}

	interface Room {
		populateMemoryResources(): void;
	}
}

export {};

declare global {
	namespace Roles {
		interface CreepRole<C extends Creep = Creep> {
			spawn: Function;

			run(creep: C): void;
		}
	}
}

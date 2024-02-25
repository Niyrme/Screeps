declare global {
	interface Global {
		getId<T extends _HasId>(object: T): T["id"];
	}
}

global.getId = ({ id }) => id;

export {};

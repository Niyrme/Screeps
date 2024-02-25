declare global {
	interface Game {
		getId<T extends _HasId>(object: T): T["id"];
	}
}

Game.getId = ({ id }) => id;

export {};

import "./Math.ts";
import "./Number.ts";
import "./Object.ts";

declare global {
	interface Global {
		getId<T extends _HasId>(object: T): Id<T>;
	}
}

global.getId = ({ id }) => id;

export {};

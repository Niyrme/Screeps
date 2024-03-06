import "./Math.ts";
import "./Object.ts";

declare global {
	interface Global {
		getId<T extends { id: unknown }>(object: T): T["id"];
	}
}

global.getId = ({ id }) => id;

export {};

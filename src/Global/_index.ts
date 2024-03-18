import "./Math.ts";
import "./Number.ts";
import "./Object.ts";

import "./EventBus.ts";

export type * from "./EventBus.ts";

declare global {
	interface Global {
		getId<T extends _HasId>(object: T): T["id"];
	}
}

global.getId = ({ id }) => id;

export {};

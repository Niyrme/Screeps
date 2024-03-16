import "./Math.ts";
import "./Object.ts";

import "./Cache/_index.ts";
import "./EventBus/_index.ts";

export type * from "./EventBus/_index.ts";

declare global {
	interface Global {
		getId<T extends { id: unknown }>(object: T): T["id"];
	}
}

global.getId = ({ id }) => id;

export {};

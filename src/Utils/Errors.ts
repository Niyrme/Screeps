export const ErrorMap = new Map<ScreepsReturnCode, string>([
	[OK, "OK"],
	[ERR_NOT_OWNER, "ERR_NOT_OWNER"],
	[ERR_NO_PATH, "ERR_NO_PATH"],
	[ERR_NAME_EXISTS, "ERR_NAME_EXISTS"],
	[ERR_BUSY, "ERR_BUSY"],
	[ERR_NOT_FOUND, "ERR_NOT_FOUND"],
	[ERR_NOT_ENOUGH_RESOURCES, "ERR_NOT_ENOUGH_RESOURCES"],
	[ERR_INVALID_TARGET, "ERR_INVALID_TARGET"],
	[ERR_FULL, "ERR_FULL"],
	[ERR_NOT_IN_RANGE, "ERR_NOT_IN_RANGE"],
	[ERR_INVALID_ARGS, "ERR_INVALID_ARGS"],
	[ERR_TIRED, "ERR_TIRED"],
	[ERR_NO_BODYPART, "ERR_NO_BODYPART"],
	[ERR_RCL_NOT_ENOUGH, "ERR_RCL_NOT_ENOUGH"],
	[ERR_GCL_NOT_ENOUGH, "ERR_GCL_NOT_ENOUGH"],
]);

export function CodeToString<C extends ScreepsReturnCode>(errorCode: C): string {
	return ErrorMap.get(errorCode)!;
}

export class NotImplementedError extends Error {
	constructor(message: string, context: Record<any, any> = {}) {
		let contextMsg = Object.entries(context).map(([key, value]) => `${key}: ${value}`).join("\n");
		if (contextMsg.length !== 0) {
			contextMsg = `\n${contextMsg}`;
		}
		super(`Not implemented: ${message}${contextMsg}`);
	}
}

export class UnreachableError extends Error {
	constructor(message: string, context: Record<any, any> = {}) {
		let contextMsg = Object.entries(context).map(([key, value]) => `${key}: ${value}`).join("\n");
		if (contextMsg.length !== 0) {
			contextMsg = `\n${contextMsg}`;
		}
		super(`UNREACHABLE: ${message}${contextMsg}`);
	}
}

export const ErrorMap: Record<ScreepsReturnCode, string> = {
	[OK]: "OK",
	[ERR_NOT_OWNER]: "ERR_NOT_OWNER",
	[ERR_NO_PATH]: "ERR_NO_PATH",
	[ERR_NAME_EXISTS]: "ERR_NAME_EXISTS",
	[ERR_BUSY]: "ERR_BUSY",
	[ERR_NOT_FOUND]: "ERR_NOT_FOUND",
	[ERR_NOT_ENOUGH_RESOURCES]: "ERR_NOT_ENOUGH_RESOURCES",
	[ERR_INVALID_TARGET]: "ERR_INVALID_TARGET",
	[ERR_FULL]: "ERR_FULL",
	[ERR_NOT_IN_RANGE]: "ERR_NOT_IN_RANGE",
	[ERR_INVALID_ARGS]: "ERR_INVALID_ARGS",
	[ERR_TIRED]: "ERR_TIRED",
	[ERR_NO_BODYPART]: "ERR_NO_BODYPART",
	[ERR_RCL_NOT_ENOUGH]: "ERR_RCL_NOT_ENOUGH",
	[ERR_GCL_NOT_ENOUGH]: "ERR_GCL_NOT_ENOUGH",
};

export function ErrorcodeToString<C extends keyof typeof ErrorMap>(errorCode: C): (typeof ErrorMap)[C] {
	return ErrorMap[errorCode];
}

export class NotImplementedError extends Error {
	constructor(context: string) {
		super(`Not implemented: ${context}`);
	}
}

export class UnreachableError extends Error {
	constructor(context: string) {
		super(`UNREACHABLE: ${context}`);
	}
}

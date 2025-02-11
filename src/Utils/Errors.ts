export const enum Errors {
	OK = "OK",
	ERR_NOT_OWNER = "ERR_NOT_OWNER",
	ERR_NO_PATH = "ERR_NO_PATH",
	ERR_NAME_EXISTS = "ERR_NAME_EXISTS",
	ERR_BUSY = "ERR_BUSY",
	ERR_NOT_FOUND = "ERR_NOT_FOUND",
	ERR_NOT_ENOUGH_RESOURCES = "ERR_NOT_ENOUGH_RESOURCES",
	ERR_INVALID_TARGET = "ERR_INVALID_TARGET",
	ERR_FULL = "ERR_FULL",
	ERR_NOT_IN_RANGE = "ERR_NOT_IN_RANGE",
	ERR_INVALID_ARGS = "ERR_INVALID_ARGS",
	ERR_TIRED = "ERR_TIRED",
	ERR_NO_BODYPART = "ERR_NO_BODYPART",
	ERR_RCL_NOT_ENOUGH = "ERR_RCL_NOT_ENOUGH",
	ERR_GCL_NOT_ENOUGH = "ERR_GCL_NOT_ENOUGH",
}

export const ErrorMap = new Map<ScreepsReturnCode, string>([
	[OK, Errors.OK],
	[ERR_NOT_OWNER, Errors.ERR_NOT_OWNER],
	[ERR_NO_PATH, Errors.ERR_NO_PATH],
	[ERR_NAME_EXISTS, Errors.ERR_NAME_EXISTS],
	[ERR_BUSY, Errors.ERR_BUSY],
	[ERR_NOT_FOUND, Errors.ERR_NOT_FOUND],
	[ERR_NOT_ENOUGH_RESOURCES, Errors.ERR_NOT_ENOUGH_RESOURCES],
	[ERR_INVALID_TARGET, Errors.ERR_INVALID_TARGET],
	[ERR_FULL, Errors.ERR_FULL],
	[ERR_NOT_IN_RANGE, Errors.ERR_NOT_IN_RANGE],
	[ERR_INVALID_ARGS, Errors.ERR_INVALID_ARGS],
	[ERR_TIRED, Errors.ERR_TIRED],
	[ERR_NO_BODYPART, Errors.ERR_NO_BODYPART],
	[ERR_RCL_NOT_ENOUGH, Errors.ERR_RCL_NOT_ENOUGH],
	[ERR_GCL_NOT_ENOUGH, Errors.ERR_GCL_NOT_ENOUGH],
]);

export function ErrorToString<C extends ScreepsReturnCode>(error: C): string {
	return ErrorMap.get(error)!;
}

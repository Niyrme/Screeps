export const enum LogLevel {
	Debug = "DEBUG",
	Info = "INFO",
	Warning = "WARNING",
	Error = "ERROR",
}

export const LogColors = new Map<LogLevel, string>([
	[LogLevel.Debug, "white"],
	[LogLevel.Info, "lightblue"],
	[LogLevel.Warning, "white"],
	[LogLevel.Error, "white"],
]);

type Values = Array<any>

export function log(level: LogLevel, ...values: Values) {
	if (level === LogLevel.Debug && !Memory.debug) { return; }

	if (LogColors.has(level)) {
		values.unshift(`<span style="color: ${LogColors.get(level)!}">[${level}]</span>`);
	}
	console.log(values);
}

type LogFunction = (...values: Values) => void

export const debug: LogFunction = (...values) => log(LogLevel.Debug, ...values);
export const info: LogFunction = (...values) => log(LogLevel.Info, ...values);
export const warning: LogFunction = (...values) => log(LogLevel.Warning, ...values);
export const error: LogFunction = (...values) => log(LogLevel.Error, ...values);

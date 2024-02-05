export const LOG_LEVEL_DEBUG = "DEBUG";
export const LOG_LEVEL_INFO = "INFO";
export const LOG_LEVEL_WARNING = "WARNING";
export const LOG_LEVEL_ERROR = "ERROR";

export const Logging = (() => {
	const logColors: Record<string, string> = {
		[LOG_LEVEL_DEBUG]: "white",
		[LOG_LEVEL_INFO]: "lightblue",
		[LOG_LEVEL_WARNING]: "orange",
		[LOG_LEVEL_ERROR]: "red",
	};

	function log(level: string, ...values: Array<unknown>) {
		console.log(`<span style="color: ${logColors[level] || "white"};">[${level}]</span>`, ...values);
	}

	const debug = (...values: Array<unknown>) => Memory.debug && log(LOG_LEVEL_DEBUG, ...values);
	const info = (...values: Array<unknown>) => log(LOG_LEVEL_INFO, ...values);
	const warning = (...values: Array<unknown>) => log(LOG_LEVEL_WARNING, ...values);
	const error = (...values: Array<unknown>) => log(LOG_LEVEL_ERROR, ...values);

	return {
		log,
		debug,
		info,
		warning,
		error,
	};
})();

export default Logging;

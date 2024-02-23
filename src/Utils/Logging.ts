export const Logging = (() => {
	const LOG_LEVEL_DEBUG = "DEBUG";
	const LOG_LEVEL_INFO = "INFO";
	const LOG_LEVEL_WARNING = "WARNING";
	const LOG_LEVEL_ERROR = "ERROR";

	function log(level: string, ...values: Array<unknown>) {
		let s = "";
		if (logColors.has(level)) {
			s += `<span style="color: ${logColors.get(level)!}">[${level}]</span>`;
		}
		console.log(s, ...values);
	}

	const debug = (...values: Array<unknown>) => Memory.debug && log(LOG_LEVEL_DEBUG, ...values);
	const info = (...values: Array<unknown>) => log(LOG_LEVEL_INFO, ...values);
	const warning = (...values: Array<unknown>) => log(LOG_LEVEL_WARNING, ...values);
	const error = (...values: Array<unknown>) => log(LOG_LEVEL_ERROR, ...values);

	return {
		LOG_LEVEL_DEBUG,
		LOG_LEVEL_INFO,
		LOG_LEVEL_WARNING,
		LOG_LEVEL_ERROR,
		log,
		debug,
		info,
		warning,
		error,
	};
})();

export const logColors = new Map([
	[Logging.LOG_LEVEL_DEBUG, "white"],
	[Logging.LOG_LEVEL_INFO, "lightblue"],
	[Logging.LOG_LEVEL_WARNING, "orange"],
	[Logging.LOG_LEVEL_ERROR, "red"],
]);

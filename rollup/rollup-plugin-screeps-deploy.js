/**
 * @returns {import("rollup").Plugin}
 */
export const screepsDeploy = ({ dest, config }) => ({
	name: "screeps-deploy",
	version: "1.0.0",
	async writeBundle(options, bundle) {
		if (!config) {
			return;
		}

		console.info(`[INFO] pushing code to config ${dest}. Branch: ${config.branch}`);

		/** @type {Record<string, string>} */
		const modules = Object.fromEntries(Object.values(bundle).map(({ fileName, code }) => [
			/^(.*?)(?:\.js)?$/.exec(fileName)[1],
			code,
		]));

		const url = new URL("/api/user/code", config.host);
		if (config.port) {
			url.port = config.port;
		}

		await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Token": config.token,
			},
			body: JSON.stringify({
				branch: config.branch,
				modules,
			}),
		});
	},
});

export default screepsDeploy;

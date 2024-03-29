import { ScreepsAPI } from "screeps-api";

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

		const { branch, ...apiConfig } = config;

		const api = new ScreepsAPI(apiConfig);
		await api.code.set(branch, modules, null);
	},
});

export default screepsDeploy;

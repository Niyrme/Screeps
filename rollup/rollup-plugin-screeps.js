/**
 * @returns {import("rollup").Plugin}
 */
export const screeps = () => ({
	name: "screeps",
	version: "1.0.0",
	renderChunk(code) {
		return {
			code: code.replaceAll(/\b(?<!module\.)exports\./g, "module.exports."),
			map: null,
		};
	},
});

export default screeps;

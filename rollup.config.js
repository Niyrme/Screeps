"use strict";

import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import clear from "rollup-plugin-clear";
import screepsDeploy from "./rollup/rollup-plugin-screeps-deploy.js";
import screeps from "./rollup/rollup-plugin-screeps.js";

let cfg;
const dest = process.env.DEST;
if (dest && (!(cfg = require("./screeps.json")[dest]))) {
	throw new Error("A");
}

/** @type {import("rollup").RollupOptions} */
const options = {
	input: "src/index.ts",
	output: {
		file: `dist/main.js`,
		format: "commonjs",
		inlineDynamicImports: true,
		globals: {
			"_": "lodash",
		},
	},
	plugins: [
		clear({
			targets: ["dist"],
		}),
		nodeResolve(),
		swc({
			swc: {
				jsc: {
					parser: {
						syntax: "typescript",
						tsx: false,
						dynamicImport: false,
					},
					target: "es2017",
				},
			},
		}),
		screeps(),
		screepsDeploy({ dest, config: cfg }),
	],
};

export default options;

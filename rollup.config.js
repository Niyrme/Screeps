"use strict";

import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import terser from "@rollup/plugin-terser";
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
	input: { main: "src/index.ts" },
	output: {
		dir: "dist",
		format: "commonjs",
		globals: {
			"_": "lodash",
		},
		sourcemap: "hidden",
		sourcemapFileNames: "[name].js.map",
		inlineDynamicImports: true,
	},
	plugins: [
		clear({
			targets: ["dist"],
		}),
		commonjs(),
		nodeResolve(),
		swc({
			swc: {
				jsc: {
					parser: {
						syntax: "typescript",
						tsx: false,
						dynamicImport: true,
					},
					target: "es2018",
				},
			},
		}),
		terser({ ecma: 2018 }),
		screeps(),
		screepsDeploy({ dest, config: cfg }),
	],
};

export default options;

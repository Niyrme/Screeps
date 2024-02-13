"use strict";

import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import _ from "lodash";
import fs from "node:fs";
import path from "node:path";
import copy from "rollup-plugin-copy";
import screeps from "./rollup/rollup-plugin-screeps";
import screepsDeploy from "./rollup/rollup-plugin-screeps-deploy";

let cfg;
const dest = process.env.DEST;
if (dest && (!(cfg = require("./screeps.json")[dest]))) {
	throw new Error("A");
}

const excludeFromModules = ["lib", "util"];
const modules = fs.readdirSync("src", { recursive: false })
	.filter(name => (!_.includes(excludeFromModules, name)) && fs.statSync(path.join("src", name)).isDirectory())
	.toSorted();

/** @type {Array<Partial<import("rollup").RollupOptions>>} */
const inputs = [
	{
		input: "src/lib/_index.ts",
		output: {
			file: "dist/lib.js",
		},
	},
	{
		input: "src/util/_index.ts",
		output: {
			file: "dist/util.js",
		},
	},
	...modules.map(module => ({
		input: `src/${module}/_index.ts`,
		output: {
			file: `dist/${module}.js`,
		},
		external: [
			"util",
		],
	})),
	{
		input: "src/index.ts",
		output: {
			file: "dist/main.js",
		},
		external: [
			"lib",
			"util",
			...modules,
		],
		plugins: [
			copy({
				targets: [
					{ src: "src/lib/**/*.wasm", dest: "dist" },
				],
			}),
		],
	},
];

/** @type {Partial<import("rollup").RollupOptions>} */
const baseOptions = {
	output: {
		format: "commonjs",
		inlineDynamicImports: true,
		globals: {
			"_": "lodash",
		},
	},
	external: [
		"util",
	],
	plugins: [
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

/** @type {Array<import("rollup").RollupOptions>} */
const options = inputs.map((inputOptions) => _.merge({}, baseOptions, inputOptions));

export default options;

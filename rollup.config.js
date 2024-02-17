"use strict";

import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import fs from "node:fs";
import path from "node:path";
import screeps from "./rollup/rollup-plugin-screeps";
import screepsDeploy from "./rollup/rollup-plugin-screeps-deploy";

let cfg;
const dest = process.env.DEST;
if (dest && (!(cfg = require("./screeps.json")[dest]))) {
	throw new Error("A");
}

const modules = fs.readdirSync("src", { recursive: false }).filter(name => fs.statSync(path.join("src", name)).isDirectory());

/** @type {import("rollup").RollupOptions} */
const options = {
	input: [
		...modules.map(name => `src/${name}/_index.ts`),
		"src/index.ts",
	],
	output: {
		dir: "dist",
		format: "commonjs",
		globals: {
			"_": "lodash",
		},
		entryFileNames(chunk) {
			const chunkPath = path.parse(chunk.facadeModuleId);
			if (chunkPath.name === "_index") {
				return `${path.parse(chunkPath.dir).name}.js`;
			} else {
				return "main.js";
			}
		},
	},
	external: modules,
	plugins: [
		json({
			preferConst: true,
			compact: true,
			namedExports: false,
		}),
		nodeResolve(),
		swc({
			swc: {
				jsc: {
					parser: {
						syntax: "typescript",
						tsx: false,
						dynamicImport: true,
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

"use strict";

import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import fs from "node:fs";
import path from "node:path";
import clear from "rollup-plugin-clear";
import { screeps, screepsDeploy } from "./rollup/index";

let cfg;
const dest = process.env.DEST;
if (dest && (!(cfg = require("./screeps.json")[dest]))) {
	throw new Error("A");
}

const modules = fs.readdirSync("src", { recursive: false })
	.filter(name => fs.statSync(path.join("src", name)).isDirectory());

/** @type {import("rollup").RollupOptions} */
const options = {
	input: {
		...Object.fromEntries(modules.map(name => [name, `src/${name}/_index.ts`])),
		main: "src/index.ts",
	},
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
						dynamicImport: true,
					},
					target: "es2018",
				},
			},
		}),
		screeps(),
		screepsDeploy({ dest, config: cfg }),
	],
};

export default options;

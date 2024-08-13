import type { BuildOptions } from "esbuild";
import SourceMaps from "./plugins/source-maps";

export default {
	entryPoints: [
		{ in: "src/index.ts", out: "main" },
	],
	platform: "node",
	bundle: true,
	outdir: "dist",
	sourcemap: "external",
	sourcesContent: false,
	minify: true,
	target: "node10.13",
	format: "cjs",
	logLevel: "info",
	treeShaking: true,
	external: [
		"main.js.map",
	],
	write: false,
	plugins: [
		SourceMaps,
	],
} satisfies BuildOptions;

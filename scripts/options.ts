import type { BuildOptions } from "esbuild";

export default {
	entryPoints: [
		{ in: "src/index.ts", out: "main" },
	],
	bundle: true,
	outdir: "dist",
	sourcemap: "external",
	minify: false,
	format: "cjs",
} satisfies BuildOptions;

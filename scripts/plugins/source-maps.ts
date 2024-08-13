import assert from "assert";
import type { Plugin } from "esbuild";
import fs from "fs";
import path from "path";

export default {
	name: "source-maps",
	setup(build) {
		build.onEnd(async function (result) {
			assert(result.errors.length === 0);
			assert(result.outputFiles?.length);

			await Promise.all(result.outputFiles.map(file => new Promise(function (resolve, reject) {
				const dirName = path.dirname(file.path);
				fs.mkdirSync(dirName, { recursive: true });
				if (path.basename(file.path) === "main.js.map") {
					fs.writeFile(
						path.join(dirName, "main.js.map.js"),
						`module.exports = (${file.text.trim()})`,
						{ encoding: "utf-8" },
						function (err) {
							if (err) {
								reject(err);
							} else {
								resolve(null);
							}
						},
					);
				} else {
					fs.writeFile(file.path, file.contents, { encoding: "utf-8" }, function (err) {
						if (err) {
							reject(err);
						} else {
							resolve(null);
						}
					});
				}
			})));
		});
	},
} satisfies Plugin as Plugin;

import esbuild from "esbuild";
import options from "./options";

await esbuild.context(options).then(function (ctx) {
	console.debug("starting watch task");
	return ctx.watch().then(() => console.debug("watching..."));
});

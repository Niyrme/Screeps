import SourceMap from "source-map-js";

export type LoopFuncion = () => void

export default function ErrorMapper(loop: LoopFuncion): LoopFuncion {
	const cache = new Map<string, [LastTick: typeof Game.time, string]>();
	let sourceMapConsumer: null | SourceMap.SourceMapConsumer = null;

	const re = /:(\d+):(\d+)/;

	return function () {
		try {
			loop();
		} catch (err) {
			if (err instanceof Error && err.stack) {
				// skip sim errors
				if ("sim" in Game.rooms) {
					throw err;
				}

				const cached = cache.get(err.stack);
				if (cached && cached[0] < 100) {
					const [, errMsg] = cached;
					cache.set(err.stack, [Game.time, errMsg]);
					return;
				}

				sourceMapConsumer ||= new SourceMap.SourceMapConsumer(require("main.js.map"));

				const match = re.exec(err.stack.split("\n")[1]);
				if (!match) {
					throw err;
				}

				const srcPos = sourceMapConsumer.originalPositionFor({
					line: Number(match[1]),
					column: Number(match[2]),
				});

				console.log(`<span style="color: red">Error (${err.name}) at ${srcPos.source.slice(srcPos.source.startsWith("../src/") ? 3 : 0)}:${srcPos.line}:${srcPos.column}</span>`);
				return;
			}
			throw err;
		}
	};
}

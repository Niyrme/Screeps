interface SourceMap {
	version: number;
	file: string;
	sources: Array<string>;
	sourcesContent: Array<string>;
	names: Array<string>;
	mappings: string;
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const base64Map = new Map(chars.split("").map((char, idx) => [char, idx]));

function decode(blob: string) {
	const gen = function* () {
		yield* blob.split("");
	}();

	const decoded: Array<number> = [];

	let acc = 0;
	let depth = 0;

	for (; ;) {
		const { done, value } = gen.next();
		if (done) {
			break;
		}

		let int = base64Map.get(value)!;
		const hasContinuation = Boolean(int & (1 << 5));
		int &= (1 << 5) - 1;

		acc += int << (depth * 5);

		if (hasContinuation) {
			depth++;
		} else {
			const isNegative = Boolean(acc & 1);
			acc >>>= 1;

			decoded.push((isNegative ? -1 : 1) * acc);

			depth = acc = 0;
		}
	}

	return decoded;
}

export function SourceMapper(loop: () => void) {
	return () => {
		try {
			loop();
		} catch (e) {
			if (e instanceof Error && e.stack) {
				const match = /([a-zA-Z0-9-_]+)\.js:(\d+):(\d+)/.exec(e.stack.split("\n")[1]);
				if (!match) {
					throw e;
				}

				const [, file, lineStr, colStr] = match;
				const map = require(`./${file}.map.json`) as SourceMap;
				if (!map.mappings) {
					throw e;
				} else if (!map.sourcesContent?.length) {
					throw e;
				}

				const lineSegments = map.mappings
					.split(";")
					.map(line => line.split(",").map(decode))
					[Number(lineStr) - 1];

				const errCol = Number(colStr) - 1;

				let found = false;
				let acc = [0, 0, 0, 0];
				for (const segment of lineSegments) {
					if (acc[0] === errCol) {
						found = true;
						break;
					}
					acc = _.zipWith(acc, segment.slice(0, 4), _.add);
				}
				if (!found) { throw e; }

				const [
					_compiledSourceCol,
					sourceFileIndex,
					sourceLine,
					_sourceFileCol,
					_namesIdx,
				] = acc;

				const startLine = sourceLine - 2;
				const offset = Math.abs(Math.min(startLine, 0));

				console.log(`Error at ${map.sources[sourceFileIndex]}:${sourceLine + 1}`);
				console.log(
					map.sourcesContent[0]
						.split("\n")
						.slice(startLine + offset, sourceLine + 3)
						.map((line, idx) => {
							const isErrLine = (startLine + offset + idx) === sourceLine;
							const errMsg = `${(sourceLine + offset + idx - 1).toString().padStart(3)} | ${line}`;

							if (isErrLine) {
								return `<span style="color: red;">${errMsg}</span>`;
							} else {
								return errMsg;
							}
						})
						.join("\n"),
				);
				return;
			} else {
				throw e;
			}
		}
	};
}

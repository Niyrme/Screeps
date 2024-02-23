const wasmMap = new Map<string, WebAssembly.Instance>();

export function loadWASM<Instance extends WebAssembly.Instance, Imports extends WebAssembly.Imports = WebAssembly.Imports>(name: string, imports?: Imports): Instance {
	if (!wasmMap.has(name)) {
		wasmMap.set(name, new WebAssembly.Instance(
			// @ts-expect-error
			new WebAssembly.Module(require(name)),
			imports,
		));
	}

	return wasmMap.get(name)! as Instance;
}

import extensionBundle from "./extension-bundle.json";

export interface Stamp {
	buildings: { [C in StructureConstant]?: Array<{ x: number, y: number }> };
}

export const stamps: Record<string, Stamp> = {
	extensionBundle,
};

export default stamps;

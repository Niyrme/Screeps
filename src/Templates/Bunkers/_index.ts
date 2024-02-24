import BunkerRound from "./bunker-round.json";

export namespace Bunker {
	export interface Stage {
		rcl: number;
		buildings: Record<BuildableStructureConstant, Array<{ x: number, y: number }>>;
	}
}

export interface Bunker {
	width: number;
	height: number;
	cx: number;
	cy: number;
	stages: Array<Bunker.Stage>;
}

const Bunkers = {
	Round: BunkerRound,
};

export default Bunkers as Record<keyof typeof Bunkers, Bunker>;

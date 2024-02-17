import bunkerRound from "./bunker-round.json";

export interface BunkerStage {
	rcl: number;
	buildings: Record<BuildableStructureConstant, Array<{ x: number, y: number }>>;
}

export interface Bunker {
	width: number;
	height: number;
	cx: number;
	cy: number;
	stages: Array<BunkerStage>;
}


const bunkers = {
	bunkerRound: bunkerRound as Bunker,
};

export default bunkers;

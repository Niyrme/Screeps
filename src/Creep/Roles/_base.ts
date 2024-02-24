import { NotImplementedError } from "Utils";

export abstract class BaseRole {
	public static readonly NAME: string;

	public static spawn(spawn: StructureSpawn): StructureSpawn.SpawnCreepReturnType {
		throw new NotImplementedError(`${this}.spawn`);
	}

	public static execute(creep: Creep): ScreepsReturnCode {
		throw new NotImplementedError(`${this}.execute(${creep})`);
	}
}

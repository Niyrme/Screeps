interface EventFunction {
	(...args: Array<any>): unknown;
}

declare global {
	interface Global {
		EventBus: IEventBus;
	}

	export interface IEventBus {
		subscribe(name: string, cb: EventFunction): void;
		trigger(name: string, ...args: Array<any>): void;
	}
}

class EventBus implements IEventBus {
	private readonly eventMap: Map<string, Array<EventFunction>> = new Map();

	public subscribe(name: string, cb: EventFunction) {
		if (!this.eventMap.has(name)) {
			this.eventMap.set(name, []);
		}

		this.eventMap.get(name)!.push(cb);
	}

	public trigger(name: string, ...args: Array<any>) {
		if (this.eventMap.has(name)) {
			this.eventMap.get(name)!.forEach(cb => cb(...args));
		} else {
			return;
		}
	}
}

global.EventBus = new EventBus();

export {};

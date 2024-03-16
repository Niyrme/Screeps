export interface EventBody extends Record<any, any> {}

export interface EventCallback<B extends EventBody> {
	(eventBody: B): void;
}

declare global {
	export interface IEventBus {
		subscribe<B extends EventBody>(name: string, cb: EventCallback<B>): void;
		trigger(name: string, eventBody: EventBody): void;
	}

	interface Global {
		EventBus: IEventBus;
	}
}

class EventBus implements IEventBus {
	private readonly eventMap: Map<string, Array<EventCallback<any>>> = new Map();

	public subscribe<B extends EventBody>(name: string, cb: EventCallback<B>) {
		if (!this.eventMap.has(name)) {
			this.eventMap.set(name, []);
		}

		this.eventMap.get(name)!.push(cb);
	}

	public trigger<B extends EventBody>(name: string, eventBody: B) {
		this.eventMap.get(name)?.forEach(cb => cb(eventBody));
	}
}

global.EventBus = new EventBus();

export {};

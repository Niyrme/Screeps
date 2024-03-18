export interface EventBody extends Record<any, any> {
}

export interface EventCallback<B extends EventBody> {
	(eventBody: B): unknown;
}

declare global {
	interface Global {
		EventBus: IEventBus;
	}

	export interface IEventBusEvents extends Record<string, Record<any, any>> {
	}

	export interface IEventBus {
		subscribe<E extends keyof IEventBusEvents>(name: E, cb: EventCallback<IEventBusEvents[E]>): void;
		trigger<E extends keyof IEventBusEvents>(name: E, eventBody: IEventBusEvents[E]): void;
	}
}

class EventBus implements IEventBus {
	private readonly eventMap: Map<keyof IEventBusEvents, Array<EventCallback<IEventBusEvents[keyof IEventBusEvents]>>> = new Map();

	public subscribe<E extends keyof IEventBusEvents>(name: E, cb: EventCallback<IEventBusEvents[E]>) {
		if (!this.eventMap.has(name)) {
			this.eventMap.set(name, []);
		}

		this.eventMap.get(name)!.push(cb);
	}

	public trigger<E extends keyof IEventBusEvents>(name: E, eventBody: IEventBusEvents[E]) {
		if (this.eventMap.has(name)) {
			this.eventMap.get(name)!.forEach(cb => cb(eventBody));
		} else {
			return;
		}
	}
}

global.EventBus = new EventBus();

export {};

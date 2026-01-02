// A simple event bus implementation with pipeable streams and some operators

type Unsubscribe = () => void;
type Subscriber<T> = (event: T) => void;

export interface EventStream<T> {
	subscribe(fn: Subscriber<T>): Unsubscribe;
}

// Operators lift an EventStream<T> into an EventStream<U>
type Operator<T, U> = (source: EventStream<T>) => PipeableEventStream<U>;

// A PipeableEventStream object is just an EventStream that can be piped through operators
export interface PipeableEventStream<T> extends EventStream<T> {
	pipe<U>(op: Operator<T, U>): PipeableEventStream<U>;
}

// Helper to make an EventStream pipeable
function makePipeable<T>(stream: EventStream<T>): PipeableEventStream<T> {
	return {
		subscribe: stream.subscribe,
		pipe<U>(op: Operator<T, U>): PipeableEventStream<U> {
			return op(this);
		}
	};
}

// The EventBus interface extends PipeableEventStream with an emit method, i.e.,
// it contains both subscription and emission capabilities.
export interface EventBus<T> extends PipeableEventStream<T> {
	emit(value: T): void;
}

export function createEventBus<T>(): EventBus<T> {
	// It contains all the subscribers for the current event bus
	let subscribers: Subscriber<T>[] = [];

	const bus: EventStream<T> = {
		subscribe(fn: Subscriber<T>): Unsubscribe {
			subscribers.push(fn);
			return (): void => {
				// Drop from the list of subscribers the actual subscriber
				subscribers = subscribers.filter((sub) => sub !== fn);
			};
		}
	};

	// Create a pipeable version of the bus
	const pipeable: PipeableEventStream<T> = makePipeable({
		subscribe(fn: Subscriber<T>): Unsubscribe {
			return bus.subscribe(fn);
		}
	});

	// Return the full event bus with emit capability
	return {
		...pipeable,
		emit(event: T) {
			subscribers.forEach((fn: Subscriber<T>) => fn(event));
		}
	};
}

export function filter<T>(condition: (value: T) => boolean): Operator<T, T> {
	return (source: EventStream<T>): PipeableEventStream<T> => {
		// Creates a new event bus to emit only the filtered events
		const bus = createEventBus<T>();

		source.subscribe((value) => {
			// Only if the condition is met, emit the value in the new bus
			if (condition(value)) {
				bus.emit(value);
			}
		});

		return makePipeable(bus);
	};
}

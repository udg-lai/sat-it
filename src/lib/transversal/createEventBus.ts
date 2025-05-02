export function createEventBus<T>() {
	type Subscriber = (event: T) => void;

	let subscribers: Subscriber[] = [];

	return {
		subscribe(fn: Subscriber) {
			subscribers.push(fn);
			return () => {
				subscribers = subscribers.filter((sub) => sub !== fn);
			};
		},
		emit(event: T) {
			subscribers.forEach((fn) => fn(event));
		}
	};
}

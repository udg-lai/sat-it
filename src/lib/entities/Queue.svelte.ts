import { logError } from '$lib/states/toasts.svelte.ts';

export class Queue<T> {
	private items: T[] = $state([]);

	constructor() {
		this.items = [];
	}

	enqueue(item: T): void {
		this.items = [...this.items, item];
	}

	dequeue(): T | undefined {
		if (this.isEmpty()) {
			logError('Can not dequeue and empty queue');
		}
		const head = this.items.shift();
		this.items = [...this.items];
		return head;
	}

	pick(): T {
		if (this.isEmpty()) {
			logError('Can not pick first element of an empty queue');
		}
		return this.items[0];
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}

	size(): number {
		return this.items.length;
	}

	clear(): void {
		this.items = [];
	}

	toArray(): T[] {
		return [...this.items];
	}
}

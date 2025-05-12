import { logError } from '../logging.ts';

export class Queue<T> {
	private items: T[] = [];

	constructor() {
		this.items = [];
	}

	enqueue(item: T): void {
		this.items.push(item);
	}

	dequeue(): T | undefined {
		if (this.isEmpty()) {
			logError('Can not dequeue and empty queue');
		}
		return this.items.shift();
	}

	peek(): T {
		if (this.isEmpty()) {
			logError('Can not peek first element of an empty queue');
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
}

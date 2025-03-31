import { Trail } from './Trail.svelte.ts';

export class TrailCollection {
	private trails: Trail[] = $state([]);

	constructor() {}

	push(trail: Trail): void {
		this.trails.push(trail);
	}

	isEmpty(): boolean {
		return this.trails.length == 0;
	}

	pop(): Trail {
		if (this.isEmpty()) throw '[ERROR]: pop and empty stack';
		else return this.trails.pop() as Trail;
	}

	last(): Trail {
		if (this.isEmpty()) throw '[ERROR]: last to and empty stack';
		else {
			return this.trails[this.trails.length - 1];
		}
	}

	getTrails() {
		return this.trails;
	}

	// Functions to make this class iterable
	[Symbol.iterator]() {
		return this.trails.values();
	}

	forEach(
		callback: (trail: Trail, index: number, array: Trail[]) => void,
		thisArg?: unknown
	): void {
		this.trails.forEach(callback, thisArg);
	}
}

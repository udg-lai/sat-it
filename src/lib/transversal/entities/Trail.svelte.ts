import type DecisionVariable from '$lib/transversal/entities/DecisionLiteral.svelte.ts';
import { logError } from '../utils/logging.ts';

type Rollback = {
	type: 'Rollback';
	decision: DecisionVariable;
};

type Forward = {
	type: 'Forward';
	decision: DecisionVariable;
	propagations: DecisionVariable[];
};

export type Decision = Rollback | Forward;

export function makeRollbackDecision(decision: DecisionVariable): Rollback {
	if (!decision.isK()) {
		logError('Make Rollback Decision', `Can not make a rollback decision from ${decision.reason}`);
	}
	return {
		type: 'Rollback',
		decision
	};
}

export function makeForwardDecision(
	decision: DecisionVariable,
	propagations: DecisionVariable[] = []
): Forward {
	if (!decision.isD()) {
		logError('Make Forward Decision', `Can not make a forward decision from ${decision.reason}`);
	}
	const allArePropagations = propagations.every((d) => d.isUP());
	if (!allArePropagations) {
		logError(
			'Make Forward Decision',
			`Can not propagate any other variable different of reason 'UP'`
		);
	}
	return {
		type: 'Forward',
		decision,
		propagations
	};
}

export class Trail {
	private trail: Decision[] = $state([]);
	private followUPIndex: number = $state(-1);
	private decisionLevel: number = 0;
	private maximumDecisions: number = 0;
	private nDecision = 0;

	constructor(trailCapacity: number) {
		this.maximumDecisions = trailCapacity;
		this.nDecision = 0;
	}

	copy(): Trail {
		const newTrail = new Trail(this.maximumDecisions);
		newTrail.trail = this.copyTrail(this.trail);
		newTrail.followUPIndex = this.followUPIndex;
		newTrail.nDecision = this.nDecision;
		return newTrail;
	}

	private copyTrail(trail: Decision[]): Decision[] {
		const decisionCopier = (d: Decision) => {
			let newDecision: Decision;
			if (d.type === 'Forward') {
				const { decision, propagations }: Forward = d;
				const copies = {
					decision: decision.copy(),
					propagations: propagations.map((d) => d.copy())
				};
				newDecision = makeForwardDecision(copies.decision, copies.propagations);
			} else {
				const { decision }: Rollback = d;
				newDecision = makeRollbackDecision(decision.copy());
			}
			return newDecision;
		};
		return trail.map(decisionCopier);
	}

	getTrail(): Decision[] {
		return this.trail;
	}

	push(decision: Decision) {
		let n = 1;
		if (decision.type === 'Forward') {
			n += decision.propagations.length;
		}

		if (n <= this.remainingSpace()) {
			this.trail.push(decision);
			this.decisionLevel += n;

			if (decision.type === 'Forward') {
				this.decisionLevel++;
			}
		} else {
			console.warn('[WARN]: skipped allocating decision as trail capacity is fulfilled');
		}
	}

	private remainingSpace(): number {
		return this.maximumDecisions - this.nDecision;
	}

	public pop(): Decision | undefined {
		const decision = this.trail.pop();
		if (decision?.type === 'Forward') this.decisionLevel--;
		return decision;
	}

	[Symbol.iterator]() {
		return this.trail.values();
	}

	forEach(
		callback: (decision: Decision, index: number, array: Decision[]) => void,
		thisArg?: unknown
	): void {
		this.trail.forEach(callback, thisArg);
	}

	public updateFollowUpIndex(): void {
		this.followUPIndex = this.trail.length - 1;
	}
}

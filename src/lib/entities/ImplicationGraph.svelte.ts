import type { Either } from '$lib/types/either.ts';
import { fromLeft, isLeft, isRight, makeLeft, makeRight } from '../types/either.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { getUnitPropagationCRef } from './VariableAssignment.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import {
	isDecisionReason,
	isBackJumpingReason,
	isUnitPropagationReason,
	type Reason
} from './VariableAssignment.ts';
import type { Trail } from './Trail.svelte.ts';
import type Clause from './Clause.svelte.ts';
import type { List } from '$lib/types/types.ts';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3';

type NodeGroup =
	| 'conflict'
	| 'decision'
	| 'propagation'
	| 'conflictReason'
	| 'learned'
	| 'cutFrontier';

export class Node {
	private literal: Either<VariableAssignment, null>;
	private level: number;
	private cut: boolean;
	private frontier: boolean;

	constructor(literal: Either<VariableAssignment, null>, level: number) {
		this.literal = literal;
		this.level = level;
		this.cut = false;
		this.frontier = false;
	}

	title(): string {
		return isLeft(this.literal)
			? `${this.level} / ${this.literal.left
					.toTeX()
					.replace(/\\overline\{([^}]+)\}/g, (_, content: string) =>
						Array.from(content)
							.map((char) => `${char}\u0305`)
							.join('')
					)}`
			: `${this.level} / ⊥`;
	}

	index(): number {
		return isLeft(this.literal) ? this.literal.left.toLit() : 0;
	}

	group(): NodeGroup {
		return this._grup();
	}

	getReason(): Either<Reason, null> {
		if (isLeft(this.literal)) {
			return makeLeft(this.literal.left.getReason());
		} else {
			return makeRight(null);
		}
	}

	addToCut(): void {
		this.cut = true;
		this.frontier = true;
	}

	delveIntoCut(): void {
		this.frontier = false;
	}

	popFromCut(): void {
		this.cut = false;
		this.frontier = false;
	}

	toSimulationNode(): SimulationNodeDatum {
		return {
			index: this.index(),

			x: 0,
			y: 0,

			vx: 1,
			vy: 1,

			fx: null,
			fy: null
		};
	}

	private _grup(): NodeGroup {
		if (isRight(this.literal)) {
			return 'conflict';
		} else if (isDecisionReason(this.literal.left.getReason())) {
			return 'decision';
		} else if (isBackJumpingReason(this.literal.left.getReason())) {
			return 'learned';
		} else if (this.frontier && this.cut) {
			return 'cutFrontier';
		} else if (this.cut && !this.frontier) {
			return 'conflictReason';
		} else return 'propagation';
	}
}

export class Link {
	private source: number;
	private target: number;
	private clauseId: number;

	constructor(source: number, target: number, clauseId: number) {
		this.source = source;
		this.target = target;
		this.clauseId = clauseId;
	}

	getSource(): number {
		return this.source;
	}

	getClauseId(): number {
		return this.clauseId;
	}

	getTarget(): number {
		return this.target;
	}

	toSimulationLink(): SimulationLinkDatum<SimulationNodeDatum> {
		return {
			source: this.getSource(),
			target: this.getTarget()
		};
	}
}

export class ImplicationGraph {
	private nodes: Map<number, Node>;
	private links: Map<number, List<Link>>; // Map CRef -> list of links
	private cut: Set<number>;

	constructor(trail: Trail) {
		this.nodes = new Map();
		this.links = new Map();
		this.cut = new Set();

		const clausePool = getClausePool();

		const variableAssignments = trail.getAssignments();

		const variablesInCut = new Set<number>();

		const litToAssignmentMap = new Map<number, VariableAssignment>();

		const litLvl = new Map<number, number>();

		let currentLvl = 0;

		variableAssignments.forEach((va) => {
			litToAssignmentMap.set(va.toLit(), va);
			if (isDecisionReason(va.getReason())) {
				currentLvl++;
			}
			litLvl.set(va.toLit(), currentLvl);
		});

		this.addNode(new Node(makeRight(null), currentLvl));

		// Cerca de les variables que estan en el cut
		trail.getResolutionContext().forEach((ctx, i) => {
			if (isRight(ctx)) return;
			if (i === 0) return;
			fromLeft(ctx)
				.clause.getLiterals()
				.forEach((l) => {
					variablesInCut.add(l.toInt() > 0 ? l.toInt() : l.toInt() * -1);
				});
		});

		const assignmentsInCut = variableAssignments.filter((va) =>
			variablesInCut.has(va.toLit() > 0 ? va.toLit() : va.toLit() * -1)
		);

		trail
			.getConflictiveClause()
			?.getLiterals()
			.forEach((l) => {
				const reasonAs = litToAssignmentMap.get(l.toInt() * -1);
				const conflictClause = trail.getConflictiveClause();
				if (reasonAs && conflictClause) {
					const cRefConflict = conflictClause.getCRef();
					this.addLink(new Link(reasonAs.toLit(), 0, cRefConflict));
				}
			});

		assignmentsInCut.forEach((as) =>
			this.addNode(new Node(makeLeft(as), litLvl.get(as.toLit()) || 0))
		);

		assignmentsInCut.forEach((as) => {
			if (isUnitPropagationReason(as.getReason())) {
				const cRef = getUnitPropagationCRef(as.getReason());
				const clause = clausePool.at(cRef);

				clause.getLiterals().forEach((l) => {
					const reasonAs = litToAssignmentMap.get(l.toInt() * -1);
					if (reasonAs) {
						this.addNode(new Node(makeLeft(reasonAs), litLvl.get(reasonAs.toLit()) || 0));
						this.addLink(new Link(reasonAs.toLit(), as.toLit(), cRef));
					}
				});
			}
		});

		if (trail.getConflictiveClause()) {
			let anteriorClause = trail.getConflictiveClause() as Clause;

			trail.getResolutionContext().forEach((ctx) => {
				if (isRight(ctx)) return;
				const clause = fromLeft(ctx).clause;
				this.addCut(clause);
				this.addCut(anteriorClause);
				anteriorClause = clause;
			});
		}
	}

	addNode(node: Node): void {
		if (!this.nodes.has(node.index())) {
			this.nodes.set(node.index(), node);
		}
	}

	addLink(link: Link): void {
		const id = link.getClauseId();

		if (!this.links.has(id)) {
			this.links.set(id, []);
		}

		this.links.get(id)?.push(link);
	}

	getNodes(): List<Node> {
		return Array.from(this.nodes.values());
	}

	getLinks(): List<Link> {
		return Array.from(this.links.values()).flat();
	}

	addCut(clause: Clause): void {
		this.cut.forEach((n) => {
			this.nodes.get(n)?.delveIntoCut();
		});

		clause.getLiterals().map((l) => {
			let litInt = l.toInt();
			if (l.isFalse()) litInt = litInt * -1;
			this.addLitIntoCut(litInt);
		});
	}

	private addLitIntoCut(literal: number): void {
		this.nodes.get(literal)?.addToCut();
		this.cut.add(literal);
	}
}

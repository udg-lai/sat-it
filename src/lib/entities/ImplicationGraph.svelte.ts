import type { Either } from '$lib/types/either.ts';
import { isLeft, isRight, makeLeft, makeRight } from '../types/either.ts';
import type VariableAssignment from './VariableAssignment.ts';
import {
	isDecisionReason,
	isUnitPropagationReason,
	getUnitPropagationCRef,
} from './VariableAssignment.ts';
import type ClausePool from './ClausePool.svelte.ts';
import type Clause from './Clause.svelte.ts';
import type { List } from '$lib/types/types.ts';
import type {SimulationLinkDatum, SimulationNodeDatum} from 'd3';

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
			: `⊥ / ${this.level}`;
	}

	index(): number {
		return isLeft(this.literal) ? this.literal.left.toLit() : 0;
	}

	group(): NodeGroup {
		return this._grup();
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

	toSimulationNode(): SimulationNodeDatum{
		return{
			index: this.index(),

			x: 0,
			y: 0,

			vx: 1,
			vy: 1,

			fx: null,
			fy: null
		}
	}

	private _grup(): NodeGroup {
		if (isRight(this.literal)) {
			return 'conflict';
		} else if (isDecisionReason(this.literal.left.getReason())) {
			return 'decision';
		} else if (this.cut) {
			return 'conflictReason';
		} else if (isUnitPropagationReason(this.literal.left.getReason())) {
			return 'propagation';
		} else return 'learned';
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

	toSimulationLink(): SimulationLinkDatum<SimulationNodeDatum>{
		return{
			source: this.getSource(),
			target: this.getTarget()
		}
	}
}

export class ImplicationGraph {
	private nodes: Map<number, Node>;
	private links: Map<number, List<Link>>; // Map CRef -> list of links
	// private cut: List<number>;
	private currentLevel: number;

	constructor(assignments: VariableAssignment[], clauses: ClausePool) {
		let level = 0;
		this.nodes = new Map();
		this.links = new Map();
		assignments.map((assig) => {
			const node = new Node(makeLeft(assig), level);
			this.nodes.set(node.index(), node);
			if (isDecisionReason(assig.getReason())) {
				level++;
			} else if (isUnitPropagationReason(assig.getReason())) {
				const clause = clauses.at(getUnitPropagationCRef(assig.getReason()));
				const literals = clause.getLiterals();
				if (literals.length > 1) {
					literals.map((lit) => {
						const lsource = lit.toInt() * -1;
						const ltarget = assig.toLit() as number;
						if (lsource != ltarget && lsource != -ltarget) {
							if (!this.links.has(clause.getCRef())) {
								this.links.set(clause.getCRef(), []);
							}
							this.links.get(clause.getCRef())!.push(new Link(lsource, ltarget, clause.getCRef()));
						}
					});
				}
			}
		});
		this.currentLevel = level;
		//this.cut = [];
	}

	addConflict(conflictClause: Clause | undefined): void {
		const conflictNode = new Node(makeRight(null), this.currentLevel);
		conflictNode.addToCut();
		this.nodes.set(conflictNode.index(), conflictNode);
		if (conflictClause) {
			conflictClause.getLiterals().map((l) => {
				const lsource = l.toInt() * -1;
				const ltarget = 0;
				if (!this.links.has(conflictClause.getCRef())) {
					this.links.set(conflictClause.getCRef(), []);
				}
				this.links
					.get(conflictClause.getCRef())!
					.push(new Link(lsource, ltarget, conflictClause.getCRef()));
				this.nodes.get(lsource)?.addToCut();
			});
		}
	}

	getNodes(): List<Node> {
		return Array.from(this.nodes.values());
	}

	getLinks(): List<Link> {
		return Array.from(this.links.values()).flat();
	}

	addCut(clause: Clause): void {
		//this.cut.map((nodeId) => {
		//  this.nodes.get(nodeId)?.delveIntoCut;
		//});
		if (clause.isTemporal()) {
			clause.getLiterals().forEach((literal) => {
				const intLit = literal.toInt() * -1;
				this.nodes.get(intLit)?.addToCut();
				//this.cut.push(intLit);
			});
			return;
		}

		this.links.get(clause.getCRef())?.forEach((link) => {
			const intLit = link.getTarget();
			this.nodes.get(intLit)?.addToCut();
			//this.cut.push(intLit);
		});
	}
}

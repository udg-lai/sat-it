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
import { DirectedGraph } from 'graphology';

type NodeGroup = 'conflict' | 'decision' | 'propagation' | 'conflictReason' | 'learned';

type NodeAttributes = {
	label: string;
	x: number;
	y: number;
	size: number;
	color: string;
	cut: 0;
};

type EdgeAttributes = {
	size: number;
	label?: string;
	color?: string;
	type?: string;
};

export class Node {
	private literal: Either<VariableAssignment, null>;
	private level: number;
	private depth: number;

	constructor(literal: VariableAssignment | null = null, level: number, depth: number) {
		this.literal = literal ? makeLeft(literal) : makeRight(null);
		this.level = level;
		this.depth = depth;
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

	updateDepth(newDepth: number): boolean {
		if (this.depth < newDepth) {
			this.depth = newDepth;
			return true;
		}
		return false;
	}

	getDepth(): number {
		return this.depth;
	}

	private _grup(): NodeGroup {
		if (isRight(this.literal)) {
			return 'conflict';
		} else if (isDecisionReason(this.literal.left.getReason())) {
			return 'decision';
		} else if (isBackJumpingReason(this.literal.left.getReason())) {
			return 'learned';
		} else return 'propagation';
	}
}

export class Link {
	private source: number;
	private target: number;
	private cRef: number;

	constructor(source: number, target: number, clauseId: number) {
		this.source = source;
		this.target = target;
		this.cRef = clauseId;
	}

	getSource(): number {
		return this.source;
	}

	getcRef(): number {
		return this.cRef;
	}

	getTarget(): number {
		return this.target;
	}
}

export class ImplicationGraph {
	private nodes: Map<number, Node>; // Map Lit -> Node
	private links: Map<number, List<Link>>; // Map CRef -> list of links
	private cuts: List<number>; // Set Cref cutted
	//private depths: List<List<number>>;

	constructor(trail: Trail) {
		this.nodes = new Map();
		this.links = new Map();
		this.cuts = [];
		//this.depths = [];
		const clausePool = getClausePool();

		const variableAssignments = trail.getAssignments();

		const conflictClause = trail.getConflictiveClause();

		const variablesInCut = new Set<number>();

		const litToAssignmentMap = new Map<number, VariableAssignment>();

		const litLvl = new Map<number, number>();

		let currentLvl = 0;

		console.log(variableAssignments);
		console.log(trail.getResolutionContext());

		// Establi els nivells dels literals
		variableAssignments.forEach((va) => {
			litToAssignmentMap.set(va.toLit(), va);
			if (isDecisionReason(va.getReason())) {
				currentLvl++;
			}
			litLvl.set(va.toLit(), currentLvl);
		});

		// Afegim el node conflicte
		this.addNode(new Node(null, currentLvl, 0));

		// Cerca de les variables que estan en el cut
		trail.getResolutionContext().forEach((ctx) => {
			if (isRight(ctx)) return;
			fromLeft(ctx)
				.clause.getLiterals()
				.forEach((l) => {
					variablesInCut.add(l.toInt() > 0 ? l.toInt() : l.toInt() * -1);
				});
		});

		// Passem de variables a assignacions
		const assignmentsInCut = variableAssignments.filter((va) =>
			variablesInCut.has(va.toLit() > 0 ? va.toLit() : va.toLit() * -1)
		);

		// Creem links per els literals que connecten amb conflicte
		conflictClause?.getLiterals().forEach((l) => {
			const reasonAs = litToAssignmentMap.get(l.toInt() * -1);
			if (reasonAs && conflictClause && !conflictClause.isTemporal()) {
				const cRefConflict = conflictClause.getCRef();
				this.addNode(new Node(reasonAs, litLvl.get(reasonAs.toLit()) ?? 0, 0));
				this.addLink(new Link(reasonAs.toLit(), 0, cRefConflict));
			}
		});

		assignmentsInCut.forEach((as) => {
			this.addNode(new Node(as, litLvl.get(as.toLit()) ?? 0, 0));

			if (isUnitPropagationReason(as.getReason())) {
				const cRef = getUnitPropagationCRef(as.getReason());
				const clause = clausePool.at(cRef);

				clause.getLiterals().forEach((l) => {
					const reasonAs = litToAssignmentMap.get(l.toInt() * -1);
					if (reasonAs) {
						this.addNode(new Node(reasonAs, litLvl.get(reasonAs.toLit()) ?? 0, 0));
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
		const id = link.getcRef();

		if (!this.links.has(id)) {
			this.links.set(id, []);
		}

		this.links.get(id)?.push(link);
		//const antDepth = this.nodes.get(link.getSource())?.getDepth() ?? 0;
		const posDepth = (this.nodes.get(link.getTarget())?.getDepth() ?? 0) + 1;
		/*if(this.nodes.get(link.getSource())?.updateDepth(posDepth)){
			this.depths[antDepth].filter(n => n !== link.getSource());
			this.depths[posDepth].push(link.getSource());
		}*/
		this.nodes.get(link.getSource())?.updateDepth(posDepth);
	}

	getNodes(): List<Node> {
		return Array.from(this.nodes.values());
	}

	getLinks(): List<Link> {
		return Array.from(this.links.values()).flat();
	}

	addCut(clause: Clause): void {
		if (clause.isTemporal()) return;

		clause.getLiterals().map((l) => {
			//let litInt = l.toInt();
			if (l.isFalse())
				//litInt = litInt * -1;
				this.addLitIntoCut(clause.getCRef());
		});
	}

	toSigmaDirectedGraph(): DirectedGraph<NodeAttributes, EdgeAttributes> {
		const graph = new DirectedGraph<NodeAttributes, EdgeAttributes>();

		this.nodes.forEach((n) => graph.addNode(`${n.index()}`, this.toSigmaNode(n)));
		this.links.forEach((clauseLinks) =>
			clauseLinks.forEach((l, index) =>
				graph.addDirectedEdgeWithKey(
					`${l.getSource()}-${l.getTarget()}-${l.getcRef()}-${index}`,
					`${l.getSource()}`,
					`${l.getTarget()}`,
					this.toSigmaLink(l)
				)
			)
		);

		return graph;
	}

	private addLitIntoCut(cRef: number): void {
		this.cuts.push(cRef);
	}

	private toSigmaNode(node: Node): NodeAttributes {
		//let posY = this.depths[node.getDepth()]?.indexOf(node.index()) ?? -1;
		return {
			label: node.title(),
			x: node.getDepth() * -5,
			y: node.index(), //posY * 5, //TEMPORAL
			size: 10,
			color: '#e74c3c', //TEMPORAL
			cut: 0
		};
	}

	private toSigmaLink(link: Link): EdgeAttributes {
		return {
			size: 2,
			label: `${link.getcRef()}`
		};
	}
}

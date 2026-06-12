import type { Either } from '$lib/types/either.ts';
import { isLeft, isRight, makeLeft, makeRight } from '../types/either.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import {
	isDecisionReason,
	isBackJumpingReason,
	type Reason,
	getPropagationCRef
} from './VariableAssignment.ts';
import type { Trail } from './Trail.svelte.ts';
import type { CRef, List, Var } from '$lib/types/types.ts';
import { DirectedGraph } from 'graphology';
import { ConflictAnalysis, type VirtualResolution } from './ConflictAnalysis.svelte.ts';
import type Clause from './Clause.svelte.ts';
import type ClausePool from './ClausePool.svelte.ts';
import { fromLeft } from '$lib/types/either.ts';

type NodeGroup = 'conflict' | 'decision' | 'propagation' | 'conflictReason' | 'learned';

type NodeAttributes = {
	label: string;
	x: number;
	y: number;
	size: number;
	color: string;
	cut: number;
	group: NodeGroup;
	forceLabel: boolean;
};

type EdgeAttributes = {
	size: number;
	label?: string;
	color?: string;
	type?: string;
};

export class Node {
	private varAsig: Either<VariableAssignment, null>;
	private level: number;
	private inCut: number;

	constructor(literal: VariableAssignment | null = null, level: number) {
		this.varAsig = literal ? makeLeft(literal) : makeRight(null);
		this.level = level;
		this.inCut = 0;
	}

	title(): string {
		return isLeft(this.varAsig)
			? `${this.level} / ${this.varAsig.left.toLit()}`
			: `${this.level} / ⊥`;
	}

	index(): Var {
		return isLeft(this.varAsig) ? fromLeft(this.varAsig).variable.toInt() : 0;
	}

	group(): NodeGroup {
		return this._grup();
	}

	cut(order: number): void {
		if (this.inCut === 0) this.inCut = order;
	}

	getCut(): number {
		return this.inCut;
	}

	getReason(): Either<Reason, null> {
		if (isLeft(this.varAsig)) {
			return makeLeft(this.varAsig.left.getReason());
		} else {
			return makeRight(null);
		}
	}

	private _grup(): NodeGroup {
		if (isRight(this.varAsig)) {
			return 'conflict';
		} else if (isDecisionReason(this.varAsig.left.getReason())) {
			return 'decision';
		} else if (isBackJumpingReason(this.varAsig.left.getReason())) {
			return 'learned';
		} else return 'propagation';
	}
}

export class Link {
	private source: Var;
	private target: Var;
	private cRef: number;
	private cutted: boolean;

	constructor(target: number, source: number, clauseId: number) {
		this.source = source;
		this.target = target;
		this.cRef = clauseId;
		this.cutted = false;
	}

	cut(): void {
		this.cutted = true;
	}

	isCut(): boolean {
		return this.cutted;
	}

	getSource(): number {
		return this.source;
	}

	getcRef(): Var {
		return this.cRef;
	}

	getTarget(): Var {
		return this.target;
	}
}

export class ImplicationGraph {
	private nodes: Map<Var, Node>; // Map Lit -> Node
	private links: Map<CRef, List<Link>>; // Map CRef -> list of links
	private cuts: List<[CRef, Var] | undefined>; // List of nodes in each cut
	private currentCut: number;

	constructor(trail: Trail) {
		if (trail.getConflictiveClause() === undefined)
			throw new Error('To generate the Implication Graph trail must have the Conflictive Clause');

		this.nodes = new Map();
		this.links = new Map();
		this.cuts = [];
		this.currentCut = 0;

		const variableAssignments: VariableAssignment[] = trail.getAssignments();

		const conflictClause: Clause = trail.getConflictiveClause()!;

		const varToAssignmentMap = new Map<Var, VariableAssignment>();

		const clausePool: ClausePool = getClausePool();

		const currentLvl: number = trail.getDL();

		// Establi els nivells dels literals
		variableAssignments.forEach((va) => {
			varToAssignmentMap.set(va.variable.toInt(), va);
		});

		// Afegim el node conflicte
		this.addNode(new Node(null, currentLvl));

		this.cuts.push([conflictClause.getCRef(), 0]);

		// Precalculem el conflictAnalisis
		const conflictAnalisis: ConflictAnalysis = new ConflictAnalysis(
			conflictClause,
			trail.lastDecision(),
			trail.getPropagationsAtLevel(currentLvl)
		);

		const conflictVariablesToCut: Set<Var> = new Set(
			conflictClause.getLiterals().map((l) => l.getVariable().toInt())
		);

		conflictVariablesToCut.forEach((v) => {
			const variable = varToAssignmentMap.get(v)!;
			this.addNode(new Node(variable, trail.getVariableDL(variable.toVar())));
			this.addLink(new Link(variable.toVar(), 0, conflictClause.getCRef()));
		});

		let trailPtr: number = variableAssignments.length - 1;

		while (!conflictAnalisis.finished()) {
			const currentImplication: VariableAssignment = conflictAnalisis.currentImplication();
			const virtualResolution: VirtualResolution = conflictAnalisis.virtualResolution();

			if (isLeft(virtualResolution)) continue;

			const currentImplicationVar: Var = currentImplication.toVar();

			while (currentImplicationVar !== variableAssignments[trailPtr].toVar()) {
				this.cuts.push(undefined);
				trailPtr--;
			}
			trailPtr--;

			let addToCut = true;

			if (this.nodes.has(currentImplicationVar)) {
				if (conflictVariablesToCut.has(currentImplicationVar)) {
					this.cuts.push([conflictClause.getCRef(), currentImplicationVar]);
					conflictVariablesToCut.delete(currentImplicationVar);
					addToCut = false;
				}

				const cRefReason: CRef = getPropagationCRef(
					varToAssignmentMap.get(currentImplicationVar)!.reason
				);
				clausePool
					.at(cRefReason)
					.getLiterals()
					.filter((l) => l.getVariable().toInt() !== currentImplicationVar)
					.forEach((l) => {
						const newVar = l.getVariable().toInt();
						this.addNode(new Node(varToAssignmentMap.get(newVar), trail.getVariableDL(newVar)));
						this.addLink(new Link(newVar, currentImplicationVar, cRefReason));
					});
				if (addToCut) this.cuts.push([cRefReason, currentImplicationVar]);
			}
		}

		console.log(this.cuts);
		this.cut();
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
	}

	getNodes(): List<Node> {
		return Array.from(this.nodes.values());
	}

	getLinks(): List<Link> {
		return Array.from(this.links.values()).flat();
	}

	cut(): boolean {
		if (this.currentCut >= this.cuts.length) return false;

		let makeCut = false;

		const cut = this.cuts[this.currentCut];
		if (cut !== undefined) {
			this.links.get(cut[0])?.forEach((link) => link.cut());
			this.nodes.get(cut[1])?.cut(this.currentCut + 1);
			makeCut = true;
		}
		this.currentCut = this.currentCut + 1;
		return makeCut;
	}

	toSigmaDirectedGraph(): DirectedGraph<NodeAttributes, EdgeAttributes> {
		const graph = new DirectedGraph<NodeAttributes, EdgeAttributes>();

		const nodes = this.getNodesOrderedByCuts();
		nodes.forEach((node, i) => {
			graph.addNode(`${node.index()}`, this.toSigmaNode(node, i, nodes.length));
		});

		this.getLinks().forEach((l, index) => {
			const source = `${l.getSource()}`;
			const target = `${l.getTarget()}`;

			if (!graph.hasNode(source) || !graph.hasNode(target)) return;

			graph.addDirectedEdgeWithKey(
				`${l.getTarget()}-${l.getSource()}-${l.getcRef()}-${index}`,
				target,
				source,
				this.toSigmaLink(l)
			);
		});

		return graph;
	}

	private getNodesOrderedByCuts(): List<Node> {
		const orderedNodeIds: Var[] = [];

		this.cuts.forEach((cut) => {
			if (cut === undefined) return;
			if (!orderedNodeIds.includes(cut[1])) orderedNodeIds.push(cut[1]);
		});

		this.nodes.forEach((_, nodeId) => {
			if (!orderedNodeIds.includes(nodeId)) orderedNodeIds.push(nodeId);
		});

		return orderedNodeIds
			.map((nodeId) => this.nodes.get(nodeId))
			.filter((node) => node !== undefined);
	}

	private toSigmaNode(node: Node, index: number, totalNodes: number): NodeAttributes {
		const deg = (2 / Math.max(totalNodes, 1)) * index;
		const rad = totalNodes === 1 ? 0 : 6;
		const posX = Math.cos(deg * Math.PI) * rad;
		const posY = Math.sin(deg * Math.PI) * rad;

		return {
			label: node.title(),
			x: posX,
			y: posY,
			size: 10,
			color: 'main-bg-color',
			cut: node.getCut(),
			group: node.group(),
			forceLabel: true
		};
	}

	private toSigmaLink(link: Link): EdgeAttributes {
		return {
			size: 2,
			label: `${link.getcRef()}`,
			color: link.isCut() ? 'unsatisfied-color' : 'inspecting-color'
		};
	}
}

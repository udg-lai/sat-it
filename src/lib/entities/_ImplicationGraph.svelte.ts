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
import Clause from './Clause.svelte.ts';
import type ClausePool from './ClausePool.svelte.ts';
import { fromLeft } from '$lib/types/either.ts';
import Literal from './Literal.svelte.ts';
import Variable from './Variable.svelte.ts';

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
	cut: boolean;
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
		return isLeft(this.varAsig) ? fromLeft(this.varAsig)._variable.toInt() : 0;
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
	private trail: Trail;
	private nodes: Map<Var, Node>; // Map Lit -> Node
	private links: Map<CRef, List<Link>>; // Map CRef -> list of links
	private cuts: List<[CRef, Var] | undefined>; // List of nodes in each cut
	private currentCut: number;
	private appliedCuts: number;
	private varProp: Map<Var, Set<Var>>;

	constructor(trail: Trail) {
		if (trail.getConflictiveClause() === undefined)
			throw new Error('To generate the Implication Graph trail must have the Conflictive Clause');

		this.trail = trail;
		this.nodes = new Map();
		this.links = new Map();
		this.cuts = [];
		this.currentCut = 0;
		this.appliedCuts = 0;
		this.varProp = new Map();

		const variableAssignments: VariableAssignment[] = trail.getAssignments();

		const conflictClause: Clause = trail.getConflictiveClause()!;

		const varToAssignmentMap = new Map<Var, VariableAssignment>();

		const clausePool: ClausePool = getClausePool();

		const currentLvl: number = trail.getDL();

		// Establi els nivells dels literals
		variableAssignments.forEach((va) => {
			varToAssignmentMap.set(va._variable.toInt(), va);
		});

		// Afegim el node conflicte
		this.addNode(new Node(null, currentLvl));

		this.cuts.push([conflictClause.getCRef(), 0]);

		// Precalculem l'analisi de conflicte amb copies avaluades segons aquest trail.
		let analysisClause: Clause = this.copyClauseForTrail(conflictClause);
		const lastDecision: VariableAssignment = trail.lastDecision();
		const ldlPropagations: VariableAssignment[] = trail.getPropagationsAtLevel(currentLvl);
		let analysisPointer: number = ldlPropagations.length - 1;

		const conflictVariablesToCut: Set<Var> = new Set(
			conflictClause.getLiterals().map((l) => l.getVariable().toInt())
		);

		conflictVariablesToCut.forEach((v) => {
			const variable = varToAssignmentMap.get(v)!;
			this.addNode(new Node(variable, trail.getVariableDL(variable.toVar())));
			this.addLink(new Link(variable.toVar(), 0, conflictClause.getCRef()));
		});

		let trailPtr: number = variableAssignments.length - 1;

		while (
			!this.conflictAnalysisFinished(analysisClause, ldlPropagations, lastDecision, analysisPointer)
		) {
			const currentImplication: VariableAssignment = ldlPropagations[analysisPointer];
			const cRefReason: CRef = getPropagationCRef(
				varToAssignmentMap.get(currentImplication.toVar())!._reason
			);
			analysisPointer--;

			if (!analysisClause.contains(Literal.complementary(currentImplication.toLit()))) continue;

			analysisClause = analysisClause.resolution(
				this.copyClauseForTrail(clausePool.at(cRefReason))
			);

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

				clausePool
					.at(cRefReason)
					.getLiterals()
					.filter((l) => l.getVariable().toInt() !== currentImplicationVar)
					.forEach((l) => {
						const newVar: Var = l.getVariable().toInt();
						this.addNode(new Node(varToAssignmentMap.get(newVar), trail.getVariableDL(newVar)));
						this.addLink(new Link(newVar, currentImplicationVar, cRefReason));
					});
				if (addToCut) this.cuts.push([cRefReason, currentImplicationVar]);
			}
		}
		this.restoreCutsFromTrail();
	}

	addNode(node: Node): void {
		if (!this.nodes.has(node.index())) this.nodes.set(node.index(), node);
	}

	addLink(link: Link): void {
		const id = link.getcRef();

		if (!this.links.has(id)) {
			this.links.set(id, []);
		}

		if (!this.varProp.has(link.getSource())) {
			this.varProp.set(link.getSource(), new Set());
		}

		this.varProp.get(link.getSource())?.add(link.getTarget());
		this.links.get(id)?.push(link);
	}

	private copyClauseForTrail(clause: Clause): Clause {
		const assignments: Map<Var, boolean> = new Map(
			this.trail.getAssignments().map((assignment) => [assignment.toVar(), assignment.toLit() > 0])
		);

		return new Clause(
			clause.getLiterals().map((literal) => {
				const variableId = literal.getVariable().toInt();
				const variable = new Variable(variableId, assignments.get(variableId));
				return new Literal(variable, Literal.hatted(literal.toInt()));
			}),
			{
				comments: clause.getComments(),
				cRef: clause.isTemporal() ? undefined : clause.getCRef(),
				learned: clause.isLemma()
			}
		);
	}

	private conflictAnalysisFinished(
		clause: Clause,
		ldlPropagations: VariableAssignment[],
		lastDecision: VariableAssignment,
		pointer: number
	): boolean {
		const currentDecisionLevelLiterals: number[] = ldlPropagations.map((literal) =>
			literal.toLit()
		);
		currentDecisionLevelLiterals.push(lastDecision.toLit());

		return pointer < 0 || clause.isAssertive(currentDecisionLevelLiterals);
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
			this.appliedCuts++;
			this.links.get(cut[0])?.forEach((link) => link.cut());
			this.nodes.get(cut[1])?.cut(this.appliedCuts);
			makeCut = true;
		}
		this.currentCut = this.currentCut + 1;
		return makeCut;
	}

	cutAll(): void {
		while (this.currentCut < this.cuts.length) {
			this.cut();
		}
	}

	private restoreCutsFromTrail(): void {
		const resolutionSteps = this.savedResolutionSteps();

		for (let i = 0; i <= resolutionSteps; i++) {
			this.cut();
		}
	}

	private savedResolutionSteps(): number {
		const trailWithResolutionContext = this.trail as unknown as { resolutionCtx?: unknown[] };
		return trailWithResolutionContext.resolutionCtx?.length ?? 0;
	}

	private getNodeCutOrder(variable: Var): number {
		let cutOrder = 0;

		for (const cut of this.cuts) {
			if (cut === undefined) continue;

			cutOrder++;
			if (cut[1] === variable) return cutOrder;
		}

		return this.nodes.get(variable)?.getCut() ?? 0;
	}

	toSigmaDirectedGraph(): DirectedGraph<NodeAttributes, EdgeAttributes> {
		const graph = new DirectedGraph<NodeAttributes, EdgeAttributes>();

		const nodes = this.getNodesOrderedByCuts();

		const degrees = this.calcDegrees();

		nodes.forEach((node, i) => {
			graph.addNode(`${node.index()}`, this.toSigmaNode(node, i, degrees.get(node.index())!));
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

	private toSigmaNode(node: Node, iCut: number, degree: number): NodeAttributes {
		const rad = iCut;

		const dgr = 135 + degree;

		const posX = Math.cos((dgr * Math.PI) / 180) * rad;
		const posY = Math.sin((dgr * Math.PI) / 180) * rad;

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

	private calcDegrees(): Map<Var, number> {
		const degrees: Map<Var, number> = new Map();
		const impliedByReason: Map<Var, Set<Var>> = new Map();
		const conflictLiterals = this.trail.getConflictiveClause()!.getLiterals();
		const partition = conflictLiterals.length > 1 ? 90 / (conflictLiterals.length - 1) : 0;

		degrees.set(0, 0);

		conflictLiterals.forEach((l, i) => {
			degrees.set(l.getVariable().toInt(), conflictLiterals.length > 1 ? partition * i : 45);
		});

		this.getLinks().forEach((link) => {
			const reasonVar = link.getTarget();
			if (!impliedByReason.has(reasonVar)) impliedByReason.set(reasonVar, new Set());
			impliedByReason.get(reasonVar)?.add(link.getSource());
		});

		const pending: Set<Var> = new Set(this.getNodes().map((node) => node.index()));
		degrees.forEach((_, variable) => pending.delete(variable));

		let changed = true;
		while (pending.size > 0 && changed) {
			changed = false;

			pending.forEach((variable) => {
				const implied = impliedByReason.get(variable);
				if (implied === undefined) return;

				const knownImplied = Array.from(implied)
					.map((impliedVar) => ({
						variable: impliedVar,
						degree: degrees.get(impliedVar)
					}))
					.filter(
						(impliedVar): impliedVar is { variable: Var; degree: number } =>
							impliedVar.degree !== undefined
					);

				if (knownImplied.length === 0) return;

				const knownDegrees = knownImplied.map((impliedVar) => impliedVar.degree);

				const min = Math.min(...knownDegrees);
				const max = Math.max(...knownDegrees);

				degrees.set(variable, min + (max - min) / 2);
				pending.delete(variable);
				changed = true;
			});
		}

		if (pending.size > 0) {
			const partition = pending.size > 1 ? 90 / (pending.size - 1) : 0;
			Array.from(pending).forEach((variable, i) => {
				degrees.set(variable, pending.size > 1 ? partition * i : 45);
			});
		}

		return degrees;
	}

	private toSigmaLink(link: Link): EdgeAttributes {
		return {
			size: 2,
			label: `${link.getcRef()}`,
			color: link.isCut() ? 'unsatisfied-color' : 'inspecting-color',
			cut: link.isCut()
		};
	}
}

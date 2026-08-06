import { getClausePool, getVariablePool } from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import Clause from './Clause.svelte.ts';
import { ConflictAnalysis } from './ConflictAnalysis.svelte.ts';
import type Literal from './Literal.svelte.ts';
import type { Trail } from './Trail.svelte.ts';
import type Variable from './Variable.svelte.ts';
import { isImpliedReason, type Propagation, type Reason } from './VariableAssignment.ts';
import type VariableAssignment from './VariableAssignment.ts';

export type IG_Node = {
	id: string;
	content: VariableAssignment | Clause;
	dl: number;
	index?: number;
};

export type IG_Edge = {
	from: IG_Node;
	to: IG_Node;
};

export class ImplicationGraph {
	_trail: Trail;
	_nodes: IG_Node[] = $state([]);
	_edges: IG_Edge[] = $state([]);

	constructor(trail: Trail) {
		if (!trail.hasConflictiveClause())
			logFatal(
				'ImplicationGraph Error',
				'Cannot create an ImplicationGraph from a trail without a conflictive clause'
			);

		this._trail = trail;
		this._makeImplicationGraph();
	}

	nodes(): IG_Node[] {
		return this._nodes;
	}

	edges(): IG_Edge[] {
		return this._edges;
	}

	private _makeImplicationGraph(): void {
		const dl = this._trail.getDL();
		const lastDecision = this._trail.lastDecision();
		const propagations = this._trail.getPropagationsAtLevel(dl);

		const conflictAnalysis: ConflictAnalysis = new ConflictAnalysis(
			this._trail.getConflictiveClause()!,
			lastDecision,
			propagations
		);

		const cc: Clause = conflictAnalysis.getConflictiveClause();

		// Adds the empty clause to the graph, it has its own dl, which is the last decision level + 1, since it is a lemma
		const falsum: IG_Node = {
			id: 'falsum',
			content: Clause.falsum(),
			dl: dl
		};
		this._nodes.push(falsum);

		for (const literal of cc.getLiterals()) {
			const variable: Variable = literal.getVariable();

			const trailSize = this._trail.size();
			let j = trailSize - 1;
			let assignmentFound = false;

			// Search the literal in the trail
			while (j >= 0 && !assignmentFound) {
				const assignment: VariableAssignment | undefined = this._trail.at(j);
				if (assignment == undefined) {
					logFatal(
						'ImplicationGraph Error',
						`Trail index - ${j} out of bounds while building implication graph`
					);
				}
				// Var assignment found in the trail
				if (assignment.toVar() === variable.toInt()) assignmentFound = true;
				else j--;
			}

			if (!assignmentFound) {
				logFatal(
					'ImplicationGraph Error',
					`Literal ${literal.toString()} in conflict clause not found in trail`
				);
			}
			const assignment: VariableAssignment = this._trail.at(j) as VariableAssignment;

			const node: IG_Node = {
				id: assignment.toLit().toString(),
				content: assignment,
				dl: assignment.dl(),
				index: this._trail.findIndexOfAssignment(assignment)
			};
			this._nodes.push(node);

			this._edges.push({
				from: node,
				to: falsum
			});
		}

		//
		while (!conflictAnalysis.finished()) {
			const implication: VariableAssignment = conflictAnalysis.currentImplication();
			if (!implication.isImplied()) {
				logFatal(
					'ImplicationGraph Error',
					`Implication ${implication.toLit().toString()} is not implied, cannot build implication graph`
				);
			}

			let toNode: IG_Node | undefined = this._nodes.find(
				(n) => n.id === implication.toLit().toString()
			);
			if (toNode === undefined) {
				toNode = {
					id: implication.toLit().toString(),
					content: implication,
					dl: implication.dl(),
					index: this._trail.findIndexOfAssignment(implication)
				};
				this._nodes.push(toNode);
			}

			const { cRef }: Propagation = implication.getReason() as Propagation;
			const reason: Clause = getClausePool().at(cRef);

			// Makes no sense to take into account itself
			const others: Literal[] = reason
				.getLiterals()
				.filter((l) => l.toVar() !== implication.toVar());

			for (const literal of others) {
				let fromNode: IG_Node | undefined = this._nodes.find((n) => n.id === literal.toString());

				if (fromNode === undefined) {
					const variable: Variable = literal.getVariable();

					const trailSize = this._trail.size();
					let j = trailSize - 1;
					let assignmentFound = false;

					// Search the literal in the trail
					while (j >= 0 && !assignmentFound) {
						const assignment: VariableAssignment | undefined = this._trail.at(j);
						if (assignment == undefined) {
							logFatal(
								'ImplicationGraph Error',
								`Trail index - ${j} out of bounds while building implication graph`
							);
						}
						// Var assignment found in the trail
						if (assignment.toVar() === variable.toInt()) assignmentFound = true;
						else j--;
					}

					if (!assignmentFound) {
						logFatal(
							'ImplicationGraph Error',
							`Literal ${literal.toString()} in reason clause not found in trail`
						);
					}

					const assignment: VariableAssignment = this._trail.at(j) as VariableAssignment;

					fromNode = {
						id: assignment.toLit().toString(),
						content: assignment,
						dl: assignment.dl(),
						index: this._trail.findIndexOfAssignment(assignment)
					};
				}

				this._edges.push({
					from: fromNode,
					to: toNode
				});
			}

			conflictAnalysis.resolution();
		}

		this._nodes = [...this._nodes];
		this._edges = [...this._edges];

		console.log($state.snapshot(this._nodes));
		console.log($state.snapshot(this._edges));
	}
}

let implicationGraph: Maybe<ImplicationGraph> = $state(makeNothing());

export const setImplicationGraph = (ig: ImplicationGraph): void => {
	implicationGraph = makeJust(ig);
};

export const getImplicationGraph = (): Maybe<ImplicationGraph> => {
	return implicationGraph;
};

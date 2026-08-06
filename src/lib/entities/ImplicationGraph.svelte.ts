import { getClausePool } from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import type { Lit } from '$lib/types/types.ts';
import Clause from './Clause.svelte.ts';
import { ConflictAnalysis } from './ConflictAnalysis.svelte.ts';
import Literal from './Literal.svelte.ts';
import type { Trail } from './Trail.svelte.ts';
import type Variable from './Variable.svelte.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { type Propagation } from './VariableAssignment.ts';

export type IG_Node = {
	entity: VariableAssignment | Clause;
	dl: number;
	id: string;
	assignment?: {
		id: string;
		value: boolean;
		index: number; // Index that occur in the trail, used to order the nodes in the graph
	};
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
			entity: Clause.falsum(),
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
				id: assignment.toString(), // Literal representation of the variable assignment
				entity: assignment,
				dl: assignment.dl(),
				assignment: {
					id: assignment.toVar().toString(),
					value: assignment.eval(),
					index: this._trail.findIndexOfAssignment(assignment)
				}
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

			// I think probably the search and conditional are not necessary as previously
			// all literals that implied the conflictive clause were added to the graph....
			let toNode: IG_Node | undefined = this._nodes.find((n) => n.id === implication.toString());
			if (toNode === undefined) {
				toNode = {
					id: implication.toString(), // Literal representation of the variable assignment
					entity: implication,
					dl: implication.dl(),
					assignment: {
						id: implication.toVar().toString(),
						value: implication.eval(),
						index: this._trail.findIndexOfAssignment(implication)
					}
				};
				this._nodes.push(toNode);
			}

			// I can do this because previously I checked that the variable assignment was implied
			const { cRef }: Propagation = implication.getReason() as Propagation;
			const reason: Clause = getClausePool().at(cRef);

			// Makes no sense to take into account the implied literal itself
			const others: Literal[] = reason
				.getLiterals()
				.filter((l) => l.toVar() !== implication.toVar());

			for (const literal of others) {
				const complementary: Lit = Literal.complementary(literal.toInt());

				let fromNode: IG_Node | undefined = this._nodes.find(
					(n) => n.id === complementary.toString()
				);

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
						id: complementary.toString(), // Literal representation of the variable assignment
						entity: assignment,
						dl: assignment.dl(),
						assignment: {
							id: assignment.toVar().toString(),
							value: assignment.eval(),
							index: this._trail.findIndexOfAssignment(assignment)
						}
					};

					this._nodes.push(fromNode);
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

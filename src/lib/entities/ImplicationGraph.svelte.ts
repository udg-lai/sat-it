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

import { SvelteMap } from 'svelte/reactivity';

type Entity = 'VariableAssignment' | 'Clause';

export type IG_Node = {
	entity: Entity;
	dl: number;
	assignment?: {
		id: string;
		value: boolean;
		index: number; // Index that occur in the trail, used to order the nodes in the graph
		uip: boolean; // Whether the node is a UIP or not, used to highlight the node in the graph
		fuip: boolean; // Whether the node is a First UIP or not, used to highlight the node in the graph
	};
};

export type IG_Edge = {
	from: IG_Node;
	to: IG_Node;
};

export class ImplicationGraph {
	_trail: Trail;
	_nodes: SvelteMap<string, IG_Node> = new SvelteMap();
	_edges: SvelteMap<string, string[]> = new SvelteMap();

	_falsum_id = 'falsum';
	_uip_ids = new Set<string>();
	_fuip_id: string | undefined;

	_propagations_ids = new Set<string>();
	_decisions_ids = new Set<string>();

	constructor(trail: Trail) {
		if (!trail.hasConflictiveClause())
			logFatal(
				'ImplicationGraph Error',
				'Cannot create an ImplicationGraph from a trail without a conflictive clause'
			);

		this._trail = trail;
		this._makeImplicationGraph();
	}

	nodes(): string[] {
		return Array.from(this._nodes.keys());
	}

	edges(node: string): string[] {
		const edges: string[] | undefined = this._edges.get(node);
		if (edges === undefined) {
			logFatal('ImplicationGraph Error', `Node ${node} not found in the implication graph`);
		}
		return edges;
	}

	getNode(id: string): IG_Node {
		const node = this._nodes.get(id);

		if (node === undefined) {
			logFatal('ImplicationGraph Error', `Node ${id} not found in the implication graph`);
		}

		return node;
	}

	falsumId(): string {
		return this._falsum_id;
	}

	uipIds(): Set<string> {
		return new Set(this._uip_ids);
	}

	decisionsIds(): Set<string> {
		return new Set(this._decisions_ids);
	}

	propagationsIds(): Set<string> {
		return new Set(this._propagations_ids);
	}

	fuipId(): string | undefined {
		return this._fuip_id;
	}

	private _makeImplicationGraph(): void {
		const dl = this._trail.getDL();
		const lastDecision: VariableAssignment = this._trail.lastDecision();
		const propagations: VariableAssignment[] = this._trail.getPropagationsAtLevel(dl);

		// Adding this information to the graph
		this._decisions_ids.add(lastDecision.toString());
		for (const propagation of propagations) {
			this._propagations_ids.add(propagation.toString());
		}

		const conflictAnalysis: ConflictAnalysis = new ConflictAnalysis(
			this._trail.getConflictiveClause()!,
			lastDecision,
			propagations
		);

		const cc: Clause = conflictAnalysis.getConflictiveClause();

		// Adds the empty clause to the graph, it has its own dl, which is the last decision level + 1, since it is a lemma
		const falsum: IG_Node = {
			entity: 'Clause',
			dl: dl
		};

		// Adds the conflict as node
		this._nodes.set(this._falsum_id, falsum);

		// All falsified literals on the conflict clause are added to the graph, with an edge to the falsum node
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
				if (assignment.toVar() === variable.toNumber()) assignmentFound = true;
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
				entity: 'VariableAssignment',
				dl: assignment.dl(),
				assignment: {
					id: assignment.toVar().toString(),
					value: assignment.eval(),
					index: this._trail.findIndexOfAssignment(assignment),
					uip: false,
					fuip: false
				}
			};

			// Adds the falsified literal as node
			this._nodes.set(assignment.toString(), node);
			// Adds an edge from the falsified literal to the falsum node
			this._edges.set(assignment.toString(), [this._falsum_id]);
			// Adds an empty edge list for the falsum node
			this._edges.set(this._falsum_id, []);
		}

		while (!conflictAnalysis.finished()) {
			const implication: VariableAssignment = conflictAnalysis.currentImplication();
			if (!implication.isImplied()) {
				logFatal(
					'ImplicationGraph Error',
					`Implication ${implication.toLit().toString()} is not implied, cannot build implication graph`
				);
			}

			// I can do this because previously I checked that the variable assignment was implied
			const { cRef }: Propagation = implication.getReason() as Propagation;
			const reason: Clause = getClausePool().at(cRef);

			// Makes no sense to take into account the implied literal itself
			const others: Literal[] = reason
				.getLiterals()
				.filter((l) => l.toVar() !== implication.toVar());

			for (const literal of others) {
				const complementary: Lit = Literal.complementary(literal.toNumber());

				if (!this._nodes.has(complementary.toString())) {
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
						if (assignment.toVar() === variable.toNumber()) assignmentFound = true;
						else j--;
					}

					if (!assignmentFound) {
						logFatal(
							'ImplicationGraph Error',
							`Literal ${literal.toString()} in reason clause not found in trail`
						);
					}

					const assignment: VariableAssignment = this._trail.at(j) as VariableAssignment;
					// Where this assignment occurs in the trail, used to order the nodes in the graph
					const index: number = this._trail.findIndexOfAssignment(assignment);

					const fromNode: IG_Node = {
						entity: 'VariableAssignment',
						dl: assignment.dl(),
						assignment: {
							id: assignment.toVar().toString(),
							value: assignment.eval(),
							index: index,
							uip: false,
							fuip: false
						}
					};

					this._nodes.set(complementary.toString(), fromNode);
				}

				this._edges.set(complementary.toString(), [
					...(this._edges.get(complementary.toString()) ?? []),
					implication.toString()
				]);
			}

			conflictAnalysis.resolution();
		}

		// Update the nodes that are UIPs and the first UIP
		const firstUIP: VariableAssignment = conflictAnalysis.getFirstUIP();
		const id: string = firstUIP.toString();

		// Set the UIPs and the first UIP in the graph
		this._uip_ids.add(id);
		this._fuip_id = id;

		for (const uipId of this._uip_ids) {
			this._nodes.get(uipId)!.assignment!.uip = true;
		}
		this._nodes.get(this._fuip_id)!.assignment!.fuip = true;

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

export const clearImplicationGraph = (): void => {
	implicationGraph = makeNothing();
};

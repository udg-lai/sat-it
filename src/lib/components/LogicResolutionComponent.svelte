<script lang="ts">
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import TrailCollectionVisualizerComponent from '$lib/components/visualizer/TrailCollectionVisualizerComponent.svelte';
	import Literal from '$lib/transversal/entities/Literal.svelte.ts';
	import Variable, { IdVariableMap } from '$lib/transversal/entities/Variable.svelte.ts';
	import CNF, { Clause } from '$lib/transversal/entities/CNF.svelte.ts';
	import ClauseVisualizerComponent from '$lib/components/visualizer/ClauseVisualizerComponent.svelte';
	import CnfVisualizerComponent from '$lib/components/visualizer/CnfVisualizerComponent.svelte';
	import InterpretationVisualizerComponent from '$lib/components/visualizer/InterpretationVisualizerComponent.svelte';
	import DecisionLiteral, {
		AssignmentReason
	} from '$lib/transversal/entities/DecisionLiteral.svelte.ts';

	type RaWCNF = number[][];
	let visualizeTrails = false;

	const rawCNF: RaWCNF = [
		[1, -2, 3, 4],
		[3, 1, -2, -4]
	];

	const rawVariables: Set<number> = new Set(
		rawCNF.flatMap((clause) => clause.map((literal) => Math.abs(literal)))
	);

	// mapping { id } to variable type
	const variablesMap = new IdVariableMap();
	Array.from(rawVariables).forEach((v) => variablesMap.set(v, rawVariableToVariable(v)));

	const variables: Set<Variable> = new Set(Array.from(variablesMap.values()));

	const I = [
		{
			id: 1,
			assignment: false
		}
	];

	let actualTrail: Trail = new Trail(rawVariables.size);
	I.forEach(({ id, assignment }) => {
		const variable: Variable = (variablesMap.get(id) as Variable).copy();
		variable.assign(assignment);
		actualTrail.push(new DecisionLiteral(variable, AssignmentReason.D));
	});
	const trailCollection = new TrailCollection();
	trailCollection.push(actualTrail);

	const cnf: CNF = new CNF(rawCNF.map((literals) => newClause(literals)));

	function rawVariableToVariable(rvariable: number): Variable {
		if (rvariable < 0) throw 'ERROR: raw numbers should be >= 0';
		const variable = new Variable(rvariable);
		return variable;
	}

	function newClause(literals: number[]): Clause {
		return new Clause(literals.map(newLiteral));
	}

	function newLiteral(literal: number): Literal {
		const variableId = Math.abs(literal);
		if (!variablesMap.has(variableId)) throw `ERROR: variable - ${variableId} - not found`;
		const variable = variablesMap.get(variableId) as Variable;
		const polarity = literal < 0 ? 'Negative' : 'Positive';
		return new Literal(variable, polarity);
	}

	function logicResolution(c1: Clause, c2: Clause): Clause {
		const resolvedLiterals: Map<number, Literal> = new Map();

		//We need to do this as it follows as the ids of each literal are unique
		c1.forEach((lit: Literal) => resolvedLiterals.set(lit.toInt(), lit.copy()));

		let foundComplementary = false;
		for (const lit of c2) {
			const key = lit.toInt();
			// drops only the first complementary
			if (resolvedLiterals.has(key * -1) && !foundComplementary) {
				resolvedLiterals.delete(key * -1);
				foundComplementary = true;
			} // only adds if it does not exist the literal expressed as natural in the collection
			else if (!resolvedLiterals.has(key)) {
				//In case the literals is not inside the resolved clause, we add it
				resolvedLiterals.set(key, lit.copy());
			}
		}
		return new Clause(Array.from(resolvedLiterals.values()));
	}

	function decide() {
		// TODO: define decide procedure with new api
	}

	function flipVisualize() {
		visualizeTrails = !visualizeTrails;
	}

	function getCNFeval() {
		switch (cnf.eval()) {
			case 0:
				return 'UNSAT';
			case 1:
				return 'SAT';
			case 2:
				return 'UNRESOLVED';
			default:
				throw 'ERROR';
		}
	}

	const clauseToShow = logicResolution(cnf.getClause(0), cnf.getClause(1));
	console.log(clauseToShow);
</script>

<InterpretationVisualizerComponent {variables} />
<CnfVisualizerComponent {cnf} />

<p>
	Let's visualize the new clause created by applying logic resolution to the first and second clause
	of the cnf
</p>
<ClauseVisualizerComponent clause={clauseToShow} />

<p>The cnf is <strong>{getCNFeval()}</strong></p>

<button
	on:click={decide}
	class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
>
	Decide
</button>
<button
	on:click={flipVisualize}
	class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition duration-300 ease-in-out hover:bg-blue-700"
>
	visualize
</button>

<TrailCollectionVisualizerComponent {trailCollection} {visualizeTrails} />

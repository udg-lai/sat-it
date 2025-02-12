<script lang="ts">
	import { Interpretation } from '$lib/interpretation.svelte.ts';
	import Literal from '$lib/literal.svelte.ts';
	import LiteralComponent from '$lib/LiteralComponent.svelte';
	import Variable, { IdVariableMap } from '$lib/variable.svelte.ts';
	import CNF from '$lib/cnf.svelte.ts';
	import ClauseVisualizerComponent from '$lib/visualizer/ClauseVisualizerComponent.svelte';
	import CnfVisualizerComponent from '$lib/visualizer/CnfVisualizerComponent.svelte';
	import InterpretationVisualizerComponent from '$lib/visualizer/InterpretationVisualizerComponent.svelte';
	import { Toggle } from 'flowbite-svelte';

	type RaWCNF = number[][];

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
			assigment: true
		},
		{
			id: 2,
			assigment: true
		},
		{
			id: 3,
			assigment: false
		},
		{
			id: 4,
			assigment: false
		}
	];

	const II = new Interpretation(rawVariables.size);
	I.forEach(({ id, assigment }) => II.set(variablesMap.get(id) as Variable, assigment));

	const cnf: CNF = new CNF(rawCNF.map((clause) => clause.map(newLiteral)));

	assign(II);

	function assign(II: Interpretation) {
		II.forEach((assigment, variable) => {
			variable.assign(assigment);
		});
	}

	function rawVariableToVariable(rvariable: number): Variable {
		if (rvariable < 0) throw 'ERROR: raw numbers should be >= 0';
		const variable = new Variable(rvariable);
		return variable;
	}

	function newLiteral(literal: number): Literal {
		const variableId = Math.abs(literal);
		if (!variablesMap.has(variableId)) throw `ERROR: variable - ${variableId} - not found`;
		const variable = variablesMap.get(variableId) as Variable;
		const polarity = literal < 0 ? 'Negative' : 'Positive';
		return new Literal(variable, polarity);
	}

	function logicResolution(c1: Literal[], c2: Literal[]): Literal[] {
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
		return Array.from(resolvedLiterals.values());
	}
</script>

<div class="flex flex-column justify-center mt-3">
	{#each variables as variable (variable.id)}
		<span>{variable.id} - {variable.evaluate()}</span>
		<Toggle bind:checked={variable.evaluation} class="ml-1 mr-2"></Toggle>
	{/each}
</div>

<InterpretationVisualizerComponent {variables} />
<CnfVisualizerComponent {cnf}/>

<p>Let's visualize the new clause created by applying logic resolution to the first and second clause of the cnf</p>
<ClauseVisualizerComponent clause={logicResolution(cnf.getClause(0), cnf.getClause(1))}/>

<p>The cnf is <strong>{cnf.evaluate()}</strong></p>
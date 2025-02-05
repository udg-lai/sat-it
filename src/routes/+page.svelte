<script lang="ts">
	import { Interpretation } from '$lib/interpretation.svelte.ts';
	import Literal from '$lib/literal.svelte.ts';
	import LiteralComponent from '$lib/LiteralComponent.svelte';
	import Variable, { IdVariableMap } from '$lib/variable.svelte.ts';
	import ClauseVisualizerComponent from '$lib/visualizer/ClauseVisualizerComponent.svelte';
	import InterpretationVisualizerComponent from '$lib/visualizer/InterpretationVisualizerComponent.svelte';
	import { Toggle } from 'flowbite-svelte';

	type RaWCNF = number[][];
	type CNF = Literal[][];

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
		}
		,
		{
			id: 4,
			assigment: false
		}
	];

	const II = new Interpretation(rawVariables.size);
	I.forEach(({ id, assigment }) => II.set(variablesMap.get(id) as Variable, assigment));

	const cnf: CNF = rawCNF.map((clause) => clause.map(newLiteral));
	const clause = cnf[1];

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

	function logicResolution(c1: Literal[], c2: Literal[]):Literal[]{
		const resolvedLiterals: Map<number,Literal> = new Map();
		let foundComplementary = false;

		c1.forEach(l1 => {
			//We need to do this as it follows as the ids of each literal are unique
			resolvedLiterals.set(l1.variable.id * (l1.polarity === 'Negative' ? -1 : 1), new Literal(l1.variable, l1.polarity));
		});

		c2.forEach(l2 =>{
			const key = l2.variable.id * (l2.polarity === 'Negative' ? -1 : 1);
			if(resolvedLiterals.has(-key) && !foundComplementary) {
				//Found complementary, we delete it
				resolvedLiterals.delete(-key);
				foundComplementary = true;
			}
			else if(!resolvedLiterals.has(key)) {
				//In case the literals is not inside the resolved clause, we add it
				resolvedLiterals.set(key, new Literal(l2.variable, l2.polarity));
			}
		})
		return Array.from(resolvedLiterals.values());
	}
</script>

<div>
	{#each variables as variable (variable.id)}
		<span>{variable.id} - {variable.evaluate()}</span>
		<Toggle bind:checked={variable.evaluation}></Toggle>
	{/each}
</div>

<InterpretationVisualizerComponent {variables} />
{#each cnf as clause}
	<ClauseVisualizerComponent {clause} />
{/each}

<p>Let's visualize the new clause created by applying logic resolution to the first and second clause of the cnf</p>


<ClauseVisualizerComponent clause = {logicResolution(cnf[0], cnf[1])}/>
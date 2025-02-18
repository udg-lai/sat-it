<script lang="ts">
	import { Trail } from '$lib/trail.svelte.ts';
	import Literal from '$lib/literal.svelte.ts';
	import Variable, { IdVariableMap } from '$lib/variable.svelte.ts';
	import CNF, { Clause } from '$lib/cnf.svelte.ts';
	import ClauseVisualizerComponent from '$lib/visualizer/ClauseVisualizerComponent.svelte';
	import CnfVisualizerComponent from '$lib/visualizer/CnfVisualizerComponent.svelte';
	import InterpretationVisualizerComponent from '$lib/visualizer/InterpretationVisualizerComponent.svelte';
	import { Toggle } from 'flowbite-svelte';
	import DecisionVariable, { AssignmentReason } from '$lib/decisionVariable.svelte.ts';

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
		}
	];

	const II = new Trail(rawVariables.size);
	I.forEach(({ id, assigment }) => 
		II.push(new DecisionVariable(variablesMap.get(id) as Variable,
																 assigment,
																 AssignmentReason.D))
	);

	const cnf: CNF = new CNF(rawCNF.map((literals) => newClause(literals)));
	II.assign();

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

	function decide(){
		let decision = false;
		let iterator = variablesMap.entries();
		let entry = iterator.next();
		while(!decision && !entry.done){
			const [id, variable] = entry.value;
			if(!variable.assigned) {
				II.push(new DecisionVariable(variablesMap.get(id) as Variable,true, AssignmentReason.D));
				II.assign();
				decision = true;
			}
			entry = iterator.next();
		}
	}

</script>

<InterpretationVisualizerComponent {variables} />
<CnfVisualizerComponent {cnf}/>

<p>Let's visualize the new clause created by applying logic resolution to the first and second clause of the cnf</p>
<ClauseVisualizerComponent clause={logicResolution(cnf.getClause(0), cnf.getClause(1))}/>

<p>The cnf is <strong>{cnf.eval()}</strong></p>

<button 
  on:click={decide}
  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
>
  Decide
</button>


<script lang="ts">
	import { Interpretation } from '$lib/interpretation.svelte.ts';
	import Literal from '$lib/literal.svelte.ts';
  import Variable, {IdVariableMap} from '$lib/variable.svelte.ts';
	import ClauseVisualizerComponent from '$lib/visualizer/ClauseVisualizerComponent.svelte';
	import InterpretationVisualizerComponent from '$lib/visualizer/InterpretationVisualizerComponent.svelte';
  import { Toggle } from 'flowbite-svelte';

  type RaWCNF = number[][]
  type CNF = Literal[][]

  const rawCNF: RaWCNF = [
    [1, -2, 3],
    [3, 1, -2]
  ]

  const I = [
    {
      id: 1,
      assigment: true,
    },
    {
      id: 2,
      assigment: true,
    },
    {
      id: 3,
      assigment: false,
    },
  ]


  const rawVariables: Set<number> = new Set(
    rawCNF.flatMap((clause) => clause.map(literal => Math.abs(literal)))
  )

  const variablesMap: IdVariableMap = Array.from(rawVariables).reduce((D, n) => {
    D.set(n, rawVariableToVariable(n))
    return D;
  }, new IdVariableMap());
  
  const variables: Set<Variable> = new Set(
    Array.from(variablesMap.values())
  );

  const II = new Interpretation(rawVariables.size)

  I.forEach(({ id, assigment }) => { II.set(variablesMap.get(id) as Variable, assigment)})

  const cnf: CNF = rawCNF.map((clause) => clause.map(newLiteral))
  const clause = cnf[1]

  assign(II);

  function assign(II: Interpretation) {
    II.forEach((assigment, variable) => {
      variable.assign(assigment)
    })
  }

  function rawVariableToVariable(rvariable: number): Variable {
    if (rvariable < 0) throw "ERROR: raw numbers should be >= 0";
    const variable = new Variable(rvariable)
    return variable;
  }

  function newLiteral(literal: number): Literal {
    const variableId = Math.abs(literal)
    if (!variablesMap.has(variableId))
      throw `ERROR: variable - ${variableId} - not found`;
    const variable = variablesMap.get(variableId) as Variable;
    const polarity = literal < 0 ? 'Negative' : 'Positive';
    return new Literal(variable, polarity);
  }

</script>

<div>
  {#each variables as variable (variable.id)}
    <span>{variable.id} - {variable.evaluate()}</span>
    <Toggle bind:checked={variable.evaluation} ></Toggle>
  {/each}
</div>


<InterpretationVisualizerComponent variables={variables}/>
<ClauseVisualizerComponent clause={clause}/>
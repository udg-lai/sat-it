<script lang="ts">
	import Literal from '$lib/literal.svelte.ts';
  import LiteralComponent from '$lib/LiteralComponent.svelte';
  import Variable, {IdVariableMap} from '$lib/variable.svelte.ts';
  import { Toggle } from 'flowbite-svelte';
	import { onMount } from 'svelte';

  interface IdVariable { id: number, variable: Variable }
  interface Interpretation { id: number, assigment: boolean }
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

  const variables: Set<number> = new Set(
    rawCNF.flatMap((clause) => clause.map(literal => Math.abs(literal)))
  )

  const variablesMap = Array.from(variables).reduce((D, n) => {
    D.set(n, rawVariableToVariable(n))
    return D;
  }, new IdVariableMap());

  const variablesList: IdVariable[] = Array.from(
    variablesMap.entries().map(([a, b]) => {
      return {
        'id': a,
        'variable': b
      }
    })
  )

  const cnf: CNF = rawCNF.map((clause) => clause.map(newLiteral))
  const clause = cnf[1]

  assign(I);


  function assign(I: Interpretation[]) {
    I.forEach(( {id, assigment} : Interpretation ) => {
      variablesMap.get(id)?.assign(assigment)
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

  function toggleVariableState(variable: Variable) {
    if (variable.isAssigned())
      variable.negate()
    else
      variable.assign(true);
  }



</script>

<div>
  {#each variablesMap as [id, variable] (id)}
    <span>{id} - {variable.evaluate()}</span>
    <Toggle bind:checked={variable.evaluation} ></Toggle>
  {/each}
</div>


<div class="flex flex-row">
  {#each clause as literal (literal.id)}
    <LiteralComponent literal={literal}  />
  {/each}
</div>

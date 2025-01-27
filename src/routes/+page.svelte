<script lang="ts">
  import LiteralComponent from '$lib/LiteralComponent.svelte';
  import {Variable} from '$lib/variable.ts';

  interface Literal {
    value: number;
  }

  const variables = new Set([1, 2, 3])
  const variablesRef = Array.from(variables).reduce((D, n) => {
    D[n] = rawToVariableInstance(n);
    return D;
  }, {} as Record<number, Variable>);


  const clause = [1, -2, 3].map(l => {
    return {value: l}
  })

  function literalToVariableInstance(literal: Literal): Variable {
    return rawToVariableInstance(Math.abs(literal.value))
  }

  function rawToVariableInstance(n: number): Variable {
    if (n < 0) throw "ERROR: raw numbers should be >= 0";
    const variable = new Variable(n)
    return variable;
  }

  function getPolarity(literal: Literal): boolean {
    return literal.value < 0;
  }

  function fromLiteralToVariableRef(literal: Literal): Variable {
    const v = Math.abs(literal.value)
    return variablesRef[v];
  }


</script>


<div class="flex flex-row">
  {#each clause as literal}
    <LiteralComponent variable={fromLiteralToVariableRef(literal)} polarity={getPolarity(literal)} />
  {/each}
</div>

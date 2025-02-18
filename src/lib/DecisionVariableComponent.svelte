<script lang="ts">
  import type DecisionVariable from '$lib/decisionVariable.svelte.ts';
  import MathTexComponent from '$lib/MathTexComponent.svelte';

  interface Props {
    decision: DecisionVariable
  }
  let {decision}: Props = $props();
</script>

<div
  class:decide={decision.isD()}
  class:unit-propagation={decision.isUP()}
  class:backtrack={decision.isK()}
>
  <MathTexComponent equation={decision.toTeX()} />
</div>

<style>

  .decide {
    color: rgb(255, 184, 17);
  }

  .unit-propagation {
    color: #bae6ff;
  }

  .backtrack {
    color: #ffd7d9;
  }
</style>

<script lang="ts">
  import type DecisionVariable from '$lib/decisionVariable.svelte.ts';
  import MathTexComponent from '$lib/MathTexComponent.svelte';

  interface Props {
    decision: DecisionVariable
  }
  let {decision}: Props = $props();
</script>

<div class="trail"
  class:decide={decision.isD()}
  class:unit-propagation={decision.isUP()}
  class:backtrack={decision.isK()}
>
  <MathTexComponent equation={decision.toTeX()} /> &nbsp;&nbsp;&nbsp;
</div>

<style>
  .trail {
    font-size: 20px;
  }
  .decide {
    color: #1434A4;
  }

  .unit-propagation {
    color: #36454F;
  }

  .backtrack {
    color: #E4D00A;
  }
</style>

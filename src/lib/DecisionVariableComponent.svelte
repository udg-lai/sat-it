<script lang="ts">
  import type DecisionVariable from '$lib/decisionVariable.svelte.ts';
  import MathTexComponent from '$lib/MathTexComponent.svelte';

  interface Props {
    decision: DecisionVariable;
    startingDL: number;
  }
  let {decision, startingDL}: Props = $props();
  let previousDL = $derived(decision.getDL() < startingDL);
</script>

<div class="trail"
  class:decide={decision.isD() && !previousDL}
  class:decidePDL={decision.isD() && previousDL}

  class:unit-propagation={decision.isUP() && !previousDL}
  class:unit-propagationPDL={decision.isUP() && previousDL}

  class:backtrack={decision.isK() && !previousDL}
  class:backtrackPDL={decision.isK() && previousDL}
>
  <MathTexComponent equation={decision.toTeX()} /> &nbsp;&nbsp;&nbsp;
</div>

<style>
  .trail {
    font-size: 25px;
  }
  .decide {
    color: #1434A4;
  }
  
  .decidePDL {
    color: #5d71b9;
  }

  .unit-propagation {
    color: #36454F;
  }

  .unit-propagationPDL {
    color: #888d90;
  }

  .backtrack {
    color: #e5ce00;
  }
  .backtrackPDL {
    color: rgb(183, 180, 129)  }
</style>

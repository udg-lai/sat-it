<script lang="ts">
  import type DecisionVariable from '$lib/decisionVariable.svelte.ts';
  import MathTexComponent from '$lib/MathTexComponent.svelte';

  interface Props {
    decision: DecisionVariable;
    startingWP: number;
    currentWP: number;
  }
  let {decision, startingWP, currentWP}: Props = $props();
  let previousDL = $derived(currentWP < startingWP);
</script>

<div class="trail "
  class:decide={decision.isD() && !previousDL}
  class:decidePDL={decision.isD() && previousDL}

  class:unit-propagation={decision.isUP() && !previousDL}
  class:unit-propagationPDL={decision.isUP() && previousDL}

  class:backtrack={decision.isK() && !previousDL}
  class:backtrackPDL={decision.isK() && previousDL}
>
  <MathTexComponent equation={decision.toTeX()} />
</div>

<style>
  .trail {
    display: flex;
    align-items: center;
    font-size: 25px;
    padding-right: 5px;
    padding-left: 5px;
  }
  .decide {
    color: #1434A4;
  }
  
  .decidePDL {
    color: #5d71b9ea;
  }

  .unit-propagation {
    color: #36454F;
  }

  .unit-propagationPDL {
    color: #888d90ea;
  }

  .backtrack {
    color: #e7aa00;
  }
  .backtrackPDL {
    color: rgba(183, 180, 129, 0.905)  }
</style>

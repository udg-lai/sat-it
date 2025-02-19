<script lang="ts">
  import type { Trail } from '$lib/trail.svelte.ts';
  import DecisionVariableComponent from '$lib/DecisionVariableComponent.svelte';

  interface Props {
    trail: Trail;
  }
  let { trail }:Props = $props();
</script>

<div class="flex flex-row">
  {#each trail as decision}
    <DecisionVariableComponent
      decision = {decision}
      startingDL = {trail.getStartingDL()}
    />
  {/each}
</div>
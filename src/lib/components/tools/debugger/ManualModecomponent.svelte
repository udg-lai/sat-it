<script lang="ts">
	import { assignedVariables, nonAssignedVariables } from "$lib/store/debugger.store.ts";
import { emitAssignmentEvent } from "./events.svelte.ts";
  import './style.css';

  let polarity: boolean = $state(false);
  let positive: boolean = $derived(polarity);
  let variableToAssign: number = $state($nonAssignedVariables[0]);
  let variableToUnassign: number = $state($assignedVariables[0]);

</script>
<div class="mb-1 flex-row pack" style="display: flex;">
		<span class="fixed-text w-[4.5rem] grow-0">Variable:</span>

    <select class="algorithm-selector" bind:value={variableToAssign}>
      {#each $nonAssignedVariables as variable}
        <option value={variable}>{variable}</option>
      {/each}
    </select>

    <div class="flex flex-col place-content-between ml-[3px] mr-[3px]" >
      <button class="polarity" class:positive onclick={() => polarity = true}>
        <h1>True</h1>
      </button>
      <button class="polarity" class:positive={!positive} onclick={() => polarity = false}>
        <h1>False</h1>
      </button>
    </div>

		<button class="btn" onclick={() => emitAssignmentEvent('Automated')}>
			<h1>Decide</h1>
		</button>
</div>

<div class="mb-1 flex-row pack" style="display: flex;">
  <span class="fixed-text w-[4.5rem] grow-0">Variable:</span>

  <select class="algorithm-selector" bind:value={variableToUnassign}>
    {#each $assignedVariables as variable}
      <option value={variable}>{variable}</option>
    {/each}
  </select>

  <button class="btn" onclick={() => emitAssignmentEvent('Automated')}>
    <h1>Unassign</h1>
  </button>
</div>
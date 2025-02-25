<script lang="ts">
	import type { Trail } from '$lib/trail.svelte.ts';
	import DecisionVariableComponent from '$lib/DecisionVariableComponent.svelte';

	interface Props {
		trail: Trail;
	}
	let { trail }: Props = $props();
</script>

<!--
  For each decision, we will send the following:
    - decision: The decision itself as we will need to know the id and the evaluation
    - startingWP: To know the litterals that were not decided during this trail
    - currentWP: The position in the array of the decision being written down.
-->
<div class="flex flex-row">
	{#each trail as decision}
		<DecisionVariableComponent
			{decision}
			startingWP={trail.getFollowUpIndex()}
			currentWP={trail.indexOf(decision)}
		/>
	{/each}
</div>

<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import DecisionVariableComponent from '$lib/components/DecisionVariableComponent.svelte';

	interface Props {
		trail: Trail;
	}
	let { trail }: Props = $props();
</script>

<!--
  For each decision, we will send the following:
    - decision: The decision itself as we will need to know the id and the evaluation
    - startingWP: To know the literals that were not decided during this trail
    - currentWP: The position in the array of the decision being written down.
-->
<div class="trail flex flex-row">
	{#each trail as decision}
		<DecisionVariableComponent {decision} />
	{/each}
</div>

<style>
	.trail {
		display: flex;
		padding: 0.5rem;
		gap: 0.5rem;
	}
</style>

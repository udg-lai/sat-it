<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import DecisionVariableComponent from '$lib/components/decision-variable/DecisionVariableComponent.svelte';
	import { get, writable, type Writable } from 'svelte/store';

	interface Props {
		trail: Trail;
	}
	let { trail }: Props = $props();

	let toggledWritable: Writable<boolean[]> = writable([]);

	$effect(() => {
		let or = get(toggledWritable);
		let state = [...trail].map((_, idx) => or[idx] || false);
		toggledWritable.set(state);
	});

	function clickDecisionVariable(index: number) {
		toggledWritable.update((state: boolean[]) => {
			const updated = [...state];
			updated[index] = !updated[index];
			return updated;
		});
	}
</script>

<!--
  For each decision, we will send the following:
    - decision: The decision itself as we will need to know the id and the evaluation
    - startingWP: To know the literals that were not decided during this trail
    - currentWP: The position in the array of the decision being written down.
-->
<div class="trail flex flex-row">
	{#each trail as decision, index (index)}
		{#if $toggledWritable[index]}
			<div class="options flex flex-row">
				<button class="option">A</button>
				<button class="option">B</button>
				<button class="option">C</button>
			</div>
		{/if}
		<DecisionVariableComponent
			decisionVariable={decision}
			onClick={() => clickDecisionVariable(index)}
		/>
	{/each}
</div>

<style>
	.trail {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.options {
		gap: 10px;
	}

	.option {
		height: 15px;
		width: 15px;
		background-color: green;
	}
</style>

<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { get, writable, type Writable } from 'svelte/store';
	import VariableAssignmentComponent from '../VariableAssignmentComponent.svelte';

	interface Props {
		trail: Trail;
	}
	let { trail }: Props = $props();

	let all: boolean = $state(false);

	let toggledWritable: Writable<boolean[]> = writable([]);

	$effect(() => {
		let or = get(toggledWritable);
		let state = [...trail].map((_, idx) => or[idx] || false);
		toggledWritable.set(state);
	});

	function onVariableAssignmentClick(index: number) {
		toggledWritable.update((state: boolean[]) => {
			const updated = [...state];
			updated[index] = !updated[index];
			return updated;
		});
	}
</script>

<div class="trail flex flex-row">
	{#if all}
		{#each trail as assignment, index (index)}
			<VariableAssignmentComponent {assignment} onClick={() => onVariableAssignmentClick(index)} />
		{/each}
	{:else}
		{#each trail.getDecisions() as assignment, index (index)}
			<VariableAssignmentComponent {assignment} onClick={() => onVariableAssignmentClick(index)} />
		{/each}
	{/if}
</div>

<style>
	.trail {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
</style>

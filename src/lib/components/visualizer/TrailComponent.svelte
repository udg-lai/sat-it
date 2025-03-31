<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { get, writable, type Writable } from 'svelte/store';
	import VariableAssignmentComponent from '../VariableAssignmentComponent.svelte';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';

	interface Props {
		trail: Trail;
		hidePropagations: boolean
	}

	let { trail, hidePropagations }: Props = $props();

	let assignments: VariableAssignment[] = $derived(hidePropagations ? trail.getDecisions() : trail.getAssignments())

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
		{#each assignments as assignment, index (index)}
			<VariableAssignmentComponent {assignment} onClick={() => onVariableAssignmentClick(index)} />
		{/each}
</div>

<style>
	.trail {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
</style>

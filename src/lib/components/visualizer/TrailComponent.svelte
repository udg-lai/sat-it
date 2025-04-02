<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import { writable, type Writable } from 'svelte/store';
	import VariableAssignmentComponent from '../VariableAssignmentComponent.svelte';

	interface Props {
		trail: Trail;
		expandPropagations: boolean;
	}

	let { trail, expandPropagations }: Props = $props();

	let assignments: VariableAssignment[] = $derived(
		expandPropagations ? trail.getAssignments() :  trail.getDecisions()
	);

	let toggledWritable: Writable<boolean[]> = writable([]);

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

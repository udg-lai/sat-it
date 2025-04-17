<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import VariableAssignmentComponent from './VariableAssignmentComponent.svelte';
	import DecisionLevelComponent from './DecisionLevelComponent.svelte';

	interface DecisionLevel {
		assignment: VariableAssignment;
		level: number;
	}

	interface Props {
		trail: Trail;
		expandLevels: boolean;
	}

	let { trail, expandLevels }: Props = $props();

	let initialPropagations = $derived(trail.getInitialPropagations());

	let assignments: DecisionLevel[] = $derived(
		trail.getDecisions().map((a, idx) => {
			return {
				assignment: a,
				level: idx + 1
			};
		})
	);
</script>

<div class="trail flex flex-row">
	{#each initialPropagations as assignment}
		<VariableAssignmentComponent {assignment} />
	{/each}

	{#each assignments as assignment (assignment.level)}
		<DecisionLevelComponent
			decision={assignment.assignment}
			propagations={trail.getPropagations(assignment.level)}
			expanded={expandLevels}
		/>
	{/each}
</div>

<style>
	.trail {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
</style>

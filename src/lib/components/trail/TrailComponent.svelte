<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';
	import DecisionLevelComponent from './DecisionLevelComponent.svelte';

	interface DecisionLevel {
		assignment: VariableAssignment;
		level: number;
	}

	interface Props {
		trail: Trail;
		expanded: boolean;
		emitAllOpen?: () => void;
		emitNotAllOpen?: () => void;
	}

	let { trail, expanded, emitAllOpen, emitNotAllOpen }: Props = $props();

	let initialPropagations = $derived(trail.getInitialPropagations());

	let decisions: DecisionLevel[] = $derived(
		trail.getDecisions().map((a, idx) => {
			return {
				assignment: a,
				level: idx + 1
			};
		})
	);

	let nExpandable = $derived.by(() => {
		const levels: number[] = decisions.map(({ level }) => {
			return trail.hasPropagations(level) ? 1 : 0;
		});
		return levels.reduce((a, b) => a + b, 0);
	});

	let nExpanded = $state(0);

	$effect(() => {
		if (nExpanded == nExpandable) {
			emitAllOpen?.();
		} else {
			emitNotAllOpen?.();
		}
	});
</script>

<div class="trail flex flex-row">
	{#each initialPropagations as assignment}
		{#if assignment.isK()}
			<BacktrackingComponent {assignment} />
		{:else}
			<UnitPropagationComponent {assignment} />
		{/if}
	{/each}

	{#each decisions as assignment (assignment.level)}
		<DecisionLevelComponent
			decision={assignment.assignment}
			propagations={trail.getPropagations(assignment.level)}
			{expanded}
			emitClose={() => (nExpanded = Math.max(nExpanded - 1, 0))}
			emitExpand={() => (nExpanded = Math.min(nExpanded + 1, nExpandable))}
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

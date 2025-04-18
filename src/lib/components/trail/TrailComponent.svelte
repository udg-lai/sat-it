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
	}

	let { trail, expanded = $bindable(false) }: Props = $props();

	let decisionLevelExpanded = $derived(expanded);

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

	let nExpanded = $state(expanded ? countLevelsWithPropagations() : 0);

	function countLevelsWithPropagations(): number {
		const propagations: number[] = trail.getDecisions().map((_, idx) => {
			const level = idx + 1;
			return trail.hasPropagations(level) ? 1 : 0;
		});
		return propagations.reduce((a, b) => a + b, 0);
	}

	function onEmitClose(): void {
		nExpanded = Math.max(nExpanded - 1, 0);
		expanded = nExpanded === nExpandable;
	}

	function onEmitExpand(): void {
		nExpanded = Math.min(nExpanded + 1, nExpandable);
		expanded = nExpanded === nExpandable;
	}
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
			expanded={decisionLevelExpanded}
			emitClose={onEmitClose}
			emitExpand={onEmitExpand}
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

<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import BackjumpingComponent from '../assignment/BackjumpingComponent.svelte';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';
	import DecisionLevelComponent from './DecisionLevelComponent.svelte';
	import { setLastTrailSize } from './_state.svelte.ts';

	interface DecisionLevel {
		assignment: VariableAssignment;
		level: number;
	}

	interface Props {
		trail: Trail;
		expanded: boolean;
		isLast?: boolean;
	}

	let { trail, expanded, isLast = true }: Props = $props();

	let initialPropagations: VariableAssignment[] = $derived(trail.getInitialPropagations());

	let decisions: DecisionLevel[] = $derived(
		trail.getDecisions().map((a, idx) => {
			return {
				assignment: a,
				level: idx + 1
			};
		})
	);

	function listenContentWidth(element: HTMLElement) {
		const widthObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const contentWidth: number = entry.contentRect.width;
				if (isLast) {
					setLastTrailSize(contentWidth);
				}
			}
		});
		widthObserver.observe(element);
		return {
			destroy() {
				widthObserver.disconnect();
			}
		};
	}
</script>

<trail class="trail" use:listenContentWidth>
	{#each initialPropagations as assignment (assignment.variableId())}
		{#if assignment.isK()}
			<BacktrackingComponent {assignment} {isLast} />
		{:else if assignment.isBJ()}
			<BackjumpingComponent {assignment} {isLast} />
		{:else}
			<UnitPropagationComponent {assignment} {isLast} />
		{/if}
	{/each}

	{#each decisions as { level, assignment } (level)}
		<DecisionLevelComponent
			decision={assignment}
			propagations={trail.getPropagations(level)}
			{expanded}
			{isLast}
		/>
	{/each}
</trail>

<style>
	.trail {
		position: relative;
		min-height: var(--trail-height);
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: start;
		width: fit-content;
	}
</style>

<script lang="ts">
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { differOf } from '$lib/states/trail-differ-sequence.svelte.ts';
	import type { ComposedTrail } from '$lib/types/types.ts';
	import { setLastTrailSize } from '../../states/trail-size.svelte.ts';
	import BackjumpingComponent from '../assignment/BackjumpingComponent.svelte';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';
	import DecisionLevelComponent from './DecisionLevelComponent.svelte';

	interface DecisionLevel {
		assignment: VariableAssignment;
		level: number;
	}

	interface Props {
		composedTrail: ComposedTrail;
		emitRevert?: (assignment: VariableAssignment) => void;
	}

	let { composedTrail, emitRevert = () => {} }: Props = $props();

	let initialPropagations: VariableAssignment[] = $derived(
		composedTrail.trail.getInitialPropagations()
	);

	let decisions: DecisionLevel[] = $derived(
		composedTrail.trail.getDecisions().map((a, idx) => {
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
				if (composedTrail.isLast) {
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

<trail  class="trail" use:listenContentWidth>
	{#each initialPropagations as assignment (assignment.toVar())}
		{#if assignment.isK()}
			<BacktrackingComponent
				{assignment}
				isLast={composedTrail.isLast}
				fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
					differOf(composedTrail.id)}
			/>
		{:else if assignment.isBJ()}
			<BackjumpingComponent
				{assignment}
				isLast={composedTrail.isLast}
				fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
					differOf(composedTrail.id)}
				detailsExpanded={composedTrail.showCA || composedTrail.showUPs}
				showUPInfo={!composedTrail.showUPs}
			/>
		{:else}
			<UnitPropagationComponent
				{assignment}
				isLast={composedTrail.isLast}
				fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
					differOf(composedTrail.id)}
				detailsExpanded={composedTrail.showCA || composedTrail.showUPs}
				showUPInfo={!composedTrail.showUPs}
			/>
		{/if}
	{/each}

	{#each decisions as { level, assignment } (level)}
		<DecisionLevelComponent
			{composedTrail}
			decision={assignment}
			propagations={composedTrail.trail.getPropagationsAtLevel(level)}
			emitRevertUpToX={() => {
				emitRevert(assignment);
			}}
		/>
	{/each}
</trail>

<style>
	.trail {
		min-height: var(--trail-height);
		display: flex;
		flex-direction: row;
		align-items: center;
		width: fit-content;
		gap: var(--assignments-gap);
	}
</style>

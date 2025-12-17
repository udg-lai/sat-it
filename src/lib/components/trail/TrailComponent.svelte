<script lang="ts">
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { differPos } from '$lib/states/trail-diff-start.svelte.ts';
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
		trail: ComposedTrail;
		emitRevert?: (assignment: VariableAssignment) => void;
	}

	let { trail, emitRevert = () => {} }: Props = $props();

	let initialPropagations: VariableAssignment[] = $derived(trail.trail.getInitialPropagations());

	let decisions: DecisionLevel[] = $derived(
		trail.trail.getDecisions().map((a, idx) => {
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
				if (trail.isLast) {
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
	{#each initialPropagations as assignment (assignment.toVar())}
		{#if assignment.isK()}
			<BacktrackingComponent
				{assignment}
				isLast={trail.isLast}
				fromPreviousTrail={trail.trail.indexOfAssignment(assignment) < differPos(trail.index)}
			/>
		{:else if assignment.isBJ()}
			<BackjumpingComponent
				{assignment}
				isLast={trail.isLast}
				fromPreviousTrail={trail.trail.indexOfAssignment(assignment) < differPos(trail.index)}
				detailsExpanded={trail.showCA || trail.showUPs}
				showUPInfo={!trail.showUPs}
			/>
		{:else}
			<UnitPropagationComponent
				{assignment}
				isLast={trail.isLast}
				fromPreviousTrail={trail.trail.indexOfAssignment(assignment) < differPos(trail.index)}
				detailsExpanded={trail.showCA || trail.showUPs}
				showUPInfo={!trail.showUPs}
			/>
		{/if}
	{/each}

	{#each decisions as { level, assignment } (level)}
		<DecisionLevelComponent
			{trail}
			decision={assignment}
			propagations={trail.trail.getPropagationsAtLevel(level)}
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
		align-items: end;
		width: fit-content;
	}
</style>

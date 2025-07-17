<script lang="ts">
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import BackjumpingComponent from '../assignment/BackjumpingComponent.svelte';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';
	import DecisionLevelComponent from './DecisionLevelComponent.svelte';
	import { setLastTrailSize } from '../../states/trail-size.svelte.ts';

	interface DecisionLevel {
		assignment: VariableAssignment;
		level: number;
	}

	interface Props {
		trail: Trail;
		expanded: boolean;
		isLast?: boolean;
		emitRevert?: (assignment: VariableAssignment) => void;
		detailsExpanded?: boolean;
	}

	let { trail, expanded, isLast = true, emitRevert = () => {}, detailsExpanded = false}: Props = $props();

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
			<BacktrackingComponent
				{assignment}
				{isLast}
				fromPreviousTrail={trail.isAssignmentFromPreviousTrail(assignment)}
			/>
		{:else if assignment.isBJ()}
			<BackjumpingComponent
				{assignment}
				{isLast}
				fromPreviousTrail={trail.isAssignmentFromPreviousTrail(assignment)}
			/>
		{:else}
			<UnitPropagationComponent
				{assignment}
				{isLast}
				fromPreviousTrail={trail.isAssignmentFromPreviousTrail(assignment)}
				{detailsExpanded}
			/>
		{/if}
	{/each}

	{#each decisions as { level, assignment } (level)}
		<DecisionLevelComponent
			decision={assignment}
			propagations={trail.getPropagationsAt(level)}
			{expanded}
			{isLast}
			{trail}
			emitRevertUpToX={() => {
				emitRevert(assignment);
			}}
			{detailsExpanded}
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

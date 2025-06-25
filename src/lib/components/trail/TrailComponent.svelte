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
	}

	let { trail, expanded, isLast = true }: Props = $props();

	let initialPropagations: VariableAssignment[] = $derived(trail.getInitialPropagations());
	const followUpIndex: number = $derived(trail.getFollowUpIndex());

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
	{#each initialPropagations as assignment, index (assignment.variableId())}
		{#if assignment.isK()}
			<BacktrackingComponent {assignment} {isLast} fromPreviousTrail={index < followUpIndex}/>
		{:else if assignment.isBJ()}
			<BackjumpingComponent {assignment} {isLast} fromPreviousTrail={index < followUpIndex}/>
		{:else}
			<UnitPropagationComponent {assignment} {isLast} fromPreviousTrail={index < followUpIndex}/>
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
		align-items: start;
		width: fit-content;
	}
</style>

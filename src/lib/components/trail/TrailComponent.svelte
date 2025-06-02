<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
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
		isLast?: boolean;
	}

	let { trail, isLast = true }: Props = $props();

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

<trail class="trail" class:last-trail={isLast} use:listenContentWidth>
	{#each initialPropagations as assignment (assignment.variableId())}
		{#if assignment.isK()}
			<BacktrackingComponent {assignment} />
		{:else}
			<UnitPropagationComponent {assignment} />
		{/if}
	{/each}

	{#each decisions as { level, assignment } (level)}
		<DecisionLevelComponent decision={assignment} propagations={trail.getPropagations(level)} />
	{/each}
</trail>

<style>
	.trail {
		position: relative;
		min-height: var(--trail-height);
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		width: fit-content;
	}

	.last-trail {
		background-color: red;
	}
</style>

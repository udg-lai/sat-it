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

	let trailElement: HTMLElement;

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

	function listenContentWidth(trailContent: HTMLElement) {
		const trailContentWidthObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const contentWidth = entry.contentRect.width;
				const trailExpectedWidth = trailElement.offsetWidth;
				if (contentWidth > trailExpectedWidth) {
					scrollLeft();
				}
			}
		});
		trailContentWidthObserver.observe(trailContent);
		return {
			destroy() {
				trailContentWidthObserver.disconnect();
			}
		};
	}

	function scrollLeft(): void {
		trailElement.scroll({ left: trailElement.scrollWidth, behavior: 'smooth' });
	}
</script>

<trail bind:this={trailElement} class="trail flex flex-row">
	<div use:listenContentWidth class="trail-content">
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
</trail>

<style>
	.trail {
		overflow-x: scroll;
		display: flex;
		flex: 1;
		gap: 0.5rem;
		align-items: center;
		padding-right: 0.5rem;
	}

	.trail-content {
		display: flex;
		flex: 1;
		gap: 0.5rem;
		align-items: center;
		height: 100%;
	}
</style>

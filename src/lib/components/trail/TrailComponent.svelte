<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';
	import DecisionLevelComponent from './DecisionLevelComponent.svelte';
	import { setLastTrailContentWidth } from './state.svelte.ts';

	interface Props {
		trail: Trail;
		isLast?: boolean
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

	let trailElement: HTMLElement | undefined = $state(undefined);

	let trailWidth: number = $derived.by(() => {
		if (trailElement === undefined) return 0;
		return trailElement.getBoundingClientRect().width;
	});

	let contentWidth: number = $state(-1)

	let translateX: number = $derived.by(() => {
		let offset = trailWidth - contentWidth;
		return offset < 0 ? offset : 0;
	});

	function listenContentWidth(element: HTMLElement) {
		const widthObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				contentWidth = entry.contentRect.width;
			}
		});
		widthObserver.observe(element);
		return {
			destroy() {
				widthObserver.disconnect();
			}
		};
	}

	$effect(() => {
		if (isLast) {
			setLastTrailContentWidth(contentWidth);
		}
	})
</script>

<trail class="trail" class:last-trail={isLast} bind:this={trailElement}>
	translate: {translateX}  - contentWidth: {contentWidth}  - trailWidth: {trailWidth}
	<div class="trail-content" style="--translate-x: {translateX}px" use:listenContentWidth>
		{#each initialPropagations as assignment (assignment.variableId())}
			{#if assignment.isK()}
				<BacktrackingComponent {assignment} />
			{:else}
				<UnitPropagationComponent {assignment} />
			{/if}
		{/each}

		{#each decisions as { level, assignment } (level)}
			<DecisionLevelComponent
				decision={assignment}
				propagations={trail.getPropagations(level)}
			/>
		{/each}
	</div>
</trail>

<style>
	.trail {
		display: block;
		position: relative;
		height: var(--trail-height);
		width: 100%;
	}

	.last-trail {
		width: 80%;
	}

	.trail::-webkit-scrollbar {
		display: none;
		/* Safari and Chrome */
	}

	.trail-content {
		position: absolute;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		height: var(--trail-content-height);
		width: max-content;
		align-items: center;
		transform: translateX(var(--translate-x));
	}
</style>

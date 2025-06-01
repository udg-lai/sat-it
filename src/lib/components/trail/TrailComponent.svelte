<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';
	import DecisionLevelComponent from './DecisionLevelComponent.svelte';
	import { getTrailOverflow, setTrailOverflow } from './_state.svelte.ts';

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

	let trailElement: HTMLElement | undefined = $state(undefined);

	let trailWidth: number = $derived.by(() => {
		if (trailElement === undefined) return 0;
		return trailElement.getBoundingClientRect().width;
	});

	let trailOverflow: number = $derived.by(() => {
		let diff: number = 0;
		if (trailElement !== undefined) {
			diff = trailElement.clientWidth - contentWidth;
		}
		let overflow: number = 0;
		if (diff < 0) {
			overflow = Math.abs(diff);
		}
		return overflow;
	});

	let contentWidth: number = $state(-1);

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

	function scrollEnd() {
		trailElement?.scrollTo({
			left: trailElement.scrollWidth,
			behavior: 'smooth'
		});
	}

	function scrollWidth(overflow: number) {
		trailElement?.scrollTo({
			left: overflow,
			behavior: 'smooth'
		});
	}

	function rearrangeTrailScroll() {
		if (isLast) {
			setTrailOverflow(trailOverflow);
			console.log('Setting trail overflow:', trailOverflow);
			scrollEnd();
		} else {
			const overflow = getTrailOverflow();
			console.log('Rearranging trail scroll with overflow:', overflow);
			scrollWidth(overflow);
		}
	}

	$effect(() => {
		rearrangeTrailScroll();
	});
</script>

<trail class="trail" class:last-trail={isLast} bind:this={trailElement}>
	<div class="trail-content" use:listenContentWidth>
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
	</div>
</trail>

<style>
	.trail {
		display: block;
		position: relative;
		height: var(--trail-height);
		width: 100%;
		overflow-x: scroll;
	}

	.last-trail {
		width: 80%;
	}

	.trail-content {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		height: var(--trail-content-height);
		width: max-content;
		align-items: center;
	}
</style>

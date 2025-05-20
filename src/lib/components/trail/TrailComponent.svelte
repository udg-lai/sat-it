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
		if (nExpanded === 0) expanded = false;
	}

	function onEmitExpand(): void {
		nExpanded = Math.min(nExpanded + 1, nExpandable);
		if (nExpanded === nExpandable) expanded = true;
	}

	$effect(() => {
		if (expanded === false) {
			nExpanded = 0;
		} else {
			nExpanded = nExpandable;
		}
	});

	let contentOverflow = $state(false);

	function listenContentWidth(trailContent: HTMLElement) {
		const trailContentWidthObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const contentWidth = entry.contentRect.width;
				const trailExpectedWidth = trailElement.offsetWidth;
				contentOverflow = contentWidth > trailExpectedWidth;
				if (contentOverflow) {
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

	let isMiddleClicking = $state(false);
	let lastX = 0;

	let grabCursor = $derived(contentOverflow && !isMiddleClicking);
	let grabbingCursor = $derived(contentOverflow && isMiddleClicking);

	function handleMouseDown(e: MouseEvent): void {
		if (e.button === 1) {
			e.preventDefault(); // prevent browser auto-scroll
			isMiddleClicking = true;
			lastX = e.clientX;

			// Add global listeners
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
		}
	}

	function handleMouseMove(e: MouseEvent): void {
		if (!isMiddleClicking) return;

		const deltaX = e.clientX - lastX;
		trailElement.scrollLeft -= deltaX; // reverse for natural drag feel
		lastX = e.clientX;
	}

	function handleMouseUp(e: MouseEvent): void {
		if (e.button === 1) {
			isMiddleClicking = false;
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		}
	}
</script>

<trail
	bind:this={trailElement}
	class="trail flex flex-row"
	style="cursor: {grabCursor ? 'grab' : grabbingCursor ? 'grabbing' : 'unset'}"
	role="button"
	tabindex="0"
	onmousedown={handleMouseDown}
>
	<div class="trail-content" use:listenContentWidth>
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
				{expanded}
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
		-ms-overflow-style: none; /* Internet Explorer 10+ */
		scrollbar-width: none; /* Firefox */
		cursor: unset;
	}

	.trail::-webkit-scrollbar {
		display: none;
		/* Safari and Chrome */
	}

	.trail-content {
		display: flex;
		flex: 1;
		gap: 0.5rem;
		align-items: center;
		height: 100%;
	}
</style>

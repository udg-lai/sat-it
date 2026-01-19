<script lang="ts">
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { filter, type Unsubscribe } from '$lib/events/createEventBus.ts';
	import {
		algorithmicUndoEventBus,
		conflictAnalysisFinishedEventBus,
		conflictDetectedEventBus,
		decisionLevelToggledEventBus,
		expandEditorTrailsEventBus,
		resetProblemEventBus,
		solverSignalEventBus,
		trailTrackingEventBus
	} from '$lib/events/events.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import { onMount } from 'svelte';
	import ComposedTrailComponent from './ComposedTrailComponent.svelte';
	import StatusIndicator from './StatusIndicator.svelte';

	interface Props {
		trails: Trail[];
	}

	let { trails }: Props = $props();

	let editorElement: HTMLDivElement;
	let trailsLeafElement: HTMLElement;
	let userInteracting: boolean = $state(false);
	let grabbing: boolean = $state(false);
	let interactingTimeout: number | undefined = undefined;
	let userScrolling: boolean = $state(false);
	let scrollTimeout: number | undefined = undefined;
	let lastReference: number = $state(0);
	const recoveryTimeout: number = 2.5 * 1000;

	let trailsTopPosition: number[] = $state([0]);
	let composedTrailsHeight: number[] = $state([0]);

	let solver: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	let showUPs: boolean = $derived.by(() => {
		const identity = solver.identify();
		return identity === 'cdcl' || identity === 'dpll';
	});

	const scrollToBottom = (editorElement: HTMLElement) => {
		editorElement.scrollTo({ top: editorElement.scrollHeight, behavior: 'smooth' });
	};

	function isSolverRunningSolo(): boolean {
		const autoMode: boolean = solver.runningOnAutomatic();
		return autoMode;
	}

	function handleVerticalScroll() {
		if (scrollTimeout !== undefined) {
			clearTimeout(scrollTimeout);
		}
		if (isSolverRunningSolo()) {
			userScrolling = true;
			scrollTimeout = setTimeout(() => {
				userScrolling = false;
				rearrangeTrailEditor(lastReference);
			}, recoveryTimeout);
		}
	}

	function handleMouseDown() {
		if (interactingTimeout !== undefined) {
			clearTimeout(interactingTimeout);
		}
		if (isSolverRunningSolo()) {
			userInteracting = true;
			grabbing = true;
		}
	}

	function handleMouseUp() {
		if (interactingTimeout !== undefined) {
			clearTimeout(interactingTimeout);
		}
		if (isSolverRunningSolo()) {
			interactingTimeout = setTimeout(() => {
				userInteracting = false;
				rearrangeTrailEditor(lastReference);
			}, recoveryTimeout);
		}
		grabbing = false;
	}

	function rearrangeTrailEditor(reference: number) {
		lastReference = reference;
		if (userInteracting || userScrolling) {
			return;
		}
		const scrollLeft = Math.max(0, reference - (trailsLeafElement.offsetWidth * 2) / 3);
		trailsLeafElement.scrollTo({
			left: scrollLeft,
			behavior: 'smooth'
		});
	}

	function listenContentHeight(element: HTMLElement) {
		const heightObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const contentHeight: number = entry.contentRect.height;
				if (contentHeight > editorElement.offsetHeight) {
					scrollToBottom(editorElement);
				}
			}
		});
		heightObserver.observe(element);
		return {
			destroy() {
				heightObserver.disconnect();
			}
		};
	}

	function toggleTrailCtxView(trailID: number) {
		const trail: Trail | undefined = trails.at(trailID);
		if (trail === undefined) {
			logFatal('Trail not found for ID: ' + trailID);
		}
		if (solver.identify() === 'bkt' && trail.getConflictiveClause() === undefined) {
			// If the trail is running or is a model, we do not allow toggling the view
			return;
		}

		for (let i = 0; i < trails.length; i++) {
			if (trailID != i) {
				trails.at(i)?.collapseContext();
			}
		}
		trails.at(trailID)?.toggleContext();

		// This is mandatory to update the heights and positions when trails change
		// If no timeout is used, the heights are not correctly computed
		setTimeout(computeComposedTrailCompanionPositions);
	}

	function computeComposedTrailCompanionPositions(): void {
		updatesComposedTrailsHeight();
		updatesTrailTopPositions();
	}

	function asyncComputeComposedTrailCompanionPositions(): void {
		// Mandatory to let the UI update the heights and positions
		setTimeout(() => {
			updatesComposedTrailsHeight();
			updatesTrailTopPositions();
		}, 0);
	}

	function emitRevert(assignment: VariableAssignment, index: number) {
		algorithmicUndoEventBus.emit({
			decision: assignment,
			trailID: index
		});
	}

	function makeStatusIconStyle(trail: Trail): string {
		let classStyle = '';
		if (trail.showingContext()) {
			if (showUPs && !trail.hasConflictiveClause()) {
				classStyle = 'icon-bottom';
			} else if (!showUPs && trail.hasConflictiveClause()) {
				classStyle = 'icon-top';
			} else {
				classStyle = 'icon-center';
			}
		} else {
			classStyle = 'icon-center';
		}
		return classStyle;
	}

	function computeStatusIndicatorOpacity(trailID: number): string {
		return trailID + 1 < trails.length ? 'opacity-40' : '';
	}

	function getComposedTrailHeight(trailIndex: number): number {
		const el: HTMLElement | null = document.getElementById(`composed-trail_${trailIndex}`);
		if (el) {
			return el.offsetHeight;
		}
		return 0;
	}

	function updatesTrailTopPositions() {
		// Compute the top offsets of each trail
		function getTopOffset(trailIndex: number): number {
			const el: HTMLElement | null = document.getElementById(`trail_${trailIndex}`);
			if (el) {
				const rect = el.getBoundingClientRect();
				const parentRect = el.parentElement?.getBoundingClientRect();
				if (parentRect) {
					return rect.top - parentRect.top;
				}
			}
			return 10;
		}
		trailsTopPosition = trails.map((_, i) => getTopOffset(i));
	}

	function updatesComposedTrailsHeight() {
		composedTrailsHeight = trails.map((_, i) => getComposedTrailHeight(i));
	}

	function handleExpandRequest(trail: Trail) {
		// If there is at least one collapsed DL, expand all. Otherwise, collapse all.
		if (trail.anyCollapsedDL()) {
			trail.expandDLs();
		} else {
			trail.collapseDls();
			trail.expandDLs((dl) => dl == trail.getDL());
		}
		asyncComputeComposedTrailCompanionPositions();
	}

	function handleExpandCollapseEditorRequest(expand: boolean) {
		trails.forEach((trail) => {
			if (expand) {
				trail.expandAllDLs();
			} else {
				trail.collapseDls();
				trail.expandDLs((dl) => dl == trail.getDL());
			}
		});
		asyncComputeComposedTrailCompanionPositions();
	}

	function openConflictiveContext(): void {
		// When a conflict is detected, open the context of the last trail that has the conflictive clause
		for (let i = 0; i < trails.length - 1; i++) {
			const trail = trails[i];
			trail.collapseContext();
		}
		if (trails.length > 0) {
			const lastTrail = trails[trails.length - 1];
			if (lastTrail.hasConflictiveClause()) {
				lastTrail.expandContext();
			} else {
				logFatal(
					'openConflictiveContext',
					'No conflictive clause found in the last trail upon conflict detection.'
				);
			}
		} else {
			logFatal('openConflictiveContext', 'No trails available upon conflict detection.');
		}
		asyncComputeComposedTrailCompanionPositions();
	}

	$effect(() => {
		// This is mandatory to update the heights and positions when trails change
		asyncComputeComposedTrailCompanionPositions();
	});

	onMount(() => {
		const subs: Unsubscribe[] = [];

		subs.push(trailTrackingEventBus.subscribe(rearrangeTrailEditor));
		subs.push(
			solverSignalEventBus
				.pipe(filter((t) => t == 'begin-step-by-step'))
				.subscribe(() => rearrangeTrailEditor(lastReference))
		);

		subs.push(expandEditorTrailsEventBus.subscribe(handleExpandCollapseEditorRequest));
		subs.push(conflictDetectedEventBus.subscribe(openConflictiveContext));
		subs.push(
			conflictAnalysisFinishedEventBus.subscribe(asyncComputeComposedTrailCompanionPositions)
		);
		subs.push(
			decisionLevelToggledEventBus.subscribe(asyncComputeComposedTrailCompanionPositions)
		);

		subs.push(resetProblemEventBus.subscribe(asyncComputeComposedTrailCompanionPositions));

		asyncComputeComposedTrailCompanionPositions();

		return () => {
			subs.forEach((unsub) => unsub());
		};
	});
</script>

<trail-editor
	bind:this={editorElement}
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onscroll={handleVerticalScroll}
	role="presentation"
	tabindex="-1"
	class:grabbing
>
	<editor-leaf use:listenContentHeight>
		<editor-indexes class="direction container-padding">
			{#each trails as trail, id (id)}
				{@render enumerateSnippet(id, trail)}
			{/each}
		</editor-indexes>

		<trails-leaf bind:this={trailsLeafElement}>
			<editor-trails class="container-padding">
				{#each trails as trail, id (id)}
					<div id={`composed-trail_${id}`} class="composed-trail-observer">
						<ComposedTrailComponent
							trail={{
								trail: trail,
								id: id,
								isLast: trails.length === id + 1,
								showUPs: showUPs && trail.isContextExpanded(),
								showCA: trail.isContextExpanded() && trail.hasConflictiveClause()
							}}
							emitRevert={(assignment: VariableAssignment) => emitRevert(assignment, id)}
						/>
					</div>
				{/each}
			</editor-trails>
		</trails-leaf>

		<editor-info class="container-padding direction">
			{#each trails as trail, id (id)}
				<div
					class="item {computeStatusIndicatorOpacity(id)}"
					style="--height: {composedTrailsHeight[id]}px;"
				>
					<div class="trail-index" style="--top: {trailsTopPosition[id]}px;">
						<StatusIndicator
							iconClassStyle={makeStatusIconStyle(trail)}
							trailState={trail.getState()}
							expanded={trail.showingContext()}
							onToggleExpand={() => toggleTrailCtxView(id)}
							disableClick={solver.identify() === 'bkt' &&
								trail.getConflictiveClause() === undefined}
						/>
					</div>
				</div>
			{/each}
		</editor-info>
	</editor-leaf>
</trail-editor>

{#snippet enumerateSnippet(id: number, trail: Trail)}
	<div class="item" style="--height: {composedTrailsHeight[id]}px;">
		<div class="trail-index" style="--top: {trailsTopPosition[id]}px;">
			{#if trail.nDecisions() > 1}
				<button class="trail-index-content" onclick={() => handleExpandRequest(trail)}>
					<span class:opacity={id + 1 < trails.length}>{id + 1}.</span>
				</button>
			{:else}
				<div class="trail-index-content">
					<span class:opacity={id + 1 < trails.length}>{id + 1}.</span>
				</div>
			{/if}
		</div>
	</div>
{/snippet}

<style>
	trail-editor {
		position: relative;
		display: block;
		height: 75%;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1.5rem 0.5rem;
		background-color: var(--lighter-bg-color);
	}

	.grabbing {
		cursor: grabbing;
	}

	editor-leaf {
		display: grid;
		grid-template-columns: var(--trail-height) 1fr var(--trail-height);
		height: fit-content;
	}

	editor-indexes {
		display: flex;
		flex-direction: column;
	}

	trails-leaf {
		overflow-x: auto;
		overflow-y: hidden;
		height: fit-content;
		scrollbar-gutter: stable;
	}

	editor-trails {
		display: flex;
		flex-direction: column;
		width: max-content;
		gap: 0.25rem;
	}

	.item {
		height: var(--height);
		width: var(--trail-height);
		display: flex;
		justify-content: center;
		position: relative;
	}

	.trail-index {
		height: var(--trail-height);
		width: 100%;
		align-items: center;
		justify-content: center;
		display: flex;
		top: var(--top);
		position: absolute;
	}

	.trail-index-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: var(--assignment-width);
		width: var(--assignment-width);
	}

	.opacity {
		opacity: var(--opacity-50);
	}

	.opacity-40 {
		opacity: var(--non-inspecting-opacity);
	}

	.top {
		align-items: start;
	}

	.bottom {
		align-items: end;
	}

	.center {
		align-items: center;
	}

	:global(.icon-top) {
		margin-top: 0.6rem;
	}

	:global(.icon-center) {
		margin-top: 0.6rem;
	}

	:global(.icon-bottom) {
		margin-bottom: 0.6rem;
	}

	.container-padding {
		gap: var(--trails-gap);
	}

	.direction {
		display: flex;
		flex-direction: column;
	}

	.composed-trail-observer {
		height: fit-content;
	}
</style>

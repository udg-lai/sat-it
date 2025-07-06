<script lang="ts">
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import {
		algorithmicUndoEventBus,
		solverStartedAutoMode,
		toggleTrailExpandEventBus,
		trailTrackingEventBus
	} from '$lib/events/events.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { logFatal } from '$lib/stores/toasts.ts';
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

	let expandedTrails: boolean = $state(true);

	let solver: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	let showUPs: boolean = $derived.by(() => {
		const identity = solver.identify();
		return identity === 'cdcl' || identity === 'dpll';
	});

	const scrollToBottom = (editorElement: HTMLElement) => {
		editorElement.scrollTo({ top: editorElement.scrollHeight, behavior: 'smooth' });
	};

	function isSolverRunningSolo(): boolean {
		const autoMode: boolean = solver.isInAutoMode();
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

	function toggleTrailView(trailId: number) {
		const trail: Trail | undefined = trails.at(trailId);
		if (trail === undefined) {
			logFatal('Trail not found for ID: ' + trailId);
		}
		if (
			solver.identify() === 'bkt' &&
			(trail.getState() === 'running' || trail.getState() === 'sat')
		) {
			// If the trail is running or is a model, we do not allow toggling the view
			return;
		}
		for (let i = 0; i < trails.length; i++) {
			if (trailId != i) {
				trails.at(i)?.setView(false);
			}
		}
		trails.at(trailId)?.toggleView();
	}

	function computeAlign(): 'center' | 'start' {
		if (showUPs) return 'center';
		else return 'start';
	}

	function observeHeight(element: HTMLElement, trail: Trail) {
		const previewObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const height: number = entry.contentRect.height;
				trail.setHeight(height);
			}
		});
		previewObserver.observe(element);
		return {
			destroy() {
				previewObserver.disconnect();
			}
		};
	}

	function emitUndo(assignment: VariableAssignment, index: number) {
		algorithmicUndoEventBus.emit({
			objectiveAssignment: assignment,
			trailIndex: index
		});
	}

	onMount(() => {
		const unsubscribeTrailTracking = trailTrackingEventBus.subscribe(rearrangeTrailEditor);
		const unsubscribeExpandedTrails = toggleTrailExpandEventBus.subscribe(
			(expanded) => (expandedTrails = expanded)
		);
		const unsubscribeRunningOnAuto = solverStartedAutoMode.subscribe(() =>
			rearrangeTrailEditor(lastReference)
		);
		return () => {
			unsubscribeTrailTracking();
			unsubscribeExpandedTrails();
			unsubscribeRunningOnAuto();
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
		<editor-indexes class="enumerate container-padding direction">
			{#each trails as trail, index (index)}
				{@render enumerateSnippet(trail, index)}
			{/each}
		</editor-indexes>

		<trails-leaf bind:this={trailsLeafElement}>
			<editor-trails class="container-padding">
				{#each trails as trail, index (index)}
					<div use:observeHeight={trail}>
						<ComposedTrailComponent
							{trail}
							expanded={expandedTrails}
							isLast={trails.length === index + 1}
							showUPView={showUPs && trail.view()}
							showCAView={trail.view()}
							emitUndo={(assignment: VariableAssignment) => emitUndo(assignment, index)}
						/>
					</div>
				{/each}
			</editor-trails>
		</trails-leaf>

		<editor-info class="container-padding direction">
			{#each trails as trail, index (index)}
				<div class="item" style="height: {trail.getHeight()}px; --align: {computeAlign()}">
					<StatusIndicator
						classStyle={index + 1 < trails.length ? 'opacity' : ''}
						trailState={trail.getState()}
						expanded={trail.view()}
						onToggleExpand={() => toggleTrailView(index)}
					/>
				</div>
			{/each}
		</editor-info>
	</editor-leaf>
</trail-editor>

{#snippet enumerateSnippet(trail: Trail, index: number)}
	<div class="item" style="--height: {trail.getHeight()}px; --align: {computeAlign()}">
		<div class="enumerate-item">
			<span class:opacity={index + 1 < trails.length}>{index + 1}.</span>
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
		height: calc(100% - var(--debugger-height) - var(--solving-info-height));
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
		height: var(--height, var(--trail-height));
		width: var(--trail-height);
		display: flex;
		align-items: var(--align);
		justify-content: center;
		padding: 0.5rem 0rem;
	}

	.enumerate-item {
		pointer-events: none;
		width: var(--trail-literal-min-width);
		height: var(--trail-literal-min-width);
		display: flex;
		justify-content: center;
		align-items: end;
	}

	:global(.opacity) {
		opacity: var(--opacity-50);
	}

	.container-padding {
		padding: 1rem 0rem;
		gap: 1rem;
	}

	.direction {
		display: flex;
		flex-direction: column;
	}
</style>

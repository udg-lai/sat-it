<script lang="ts">
	import { writable } from 'svelte/store';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import {
		solverStartedAutoMode,
		toggleTrailExpandEventBus,
		trailTrackingEventBus
	} from '$lib/events/events.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { onMount } from 'svelte';
	import InformationComponent from './InformationComponent.svelte';
	import ComposedTrailComponent from './ComposedTrailComponent.svelte';

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

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	let upConstraint: boolean = $derived.by(() => {
		const identity = solverMachine.identify();
		return identity === 'cdcl' || identity === 'dpll';
	});

	let caConstraint: boolean = $derived.by(() => {
		const identity = solverMachine.identify();
		return identity === 'cdcl';
	});

	const scrollToBottom = (editorElement: HTMLElement) => {
		editorElement.scrollTo({ top: editorElement.scrollHeight, behavior: 'smooth' });
	};

	function isSolverRunningSolo(): boolean {
		const autoMode: boolean = solverMachine.isInAutoMode();
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
		for (let i = 0; i < trails.length; i++) {
			if (trailId != i) {
				trails.at(i)?.setView(false);
			}
		}
		trails.at(trailId)?.toggleView();
	}

	function computeAlign(): 'center' | 'end' {
		if (caConstraint) return 'center';
		else if (upConstraint) return 'end';
		else return 'center';
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
		<editor-indexes class="enumerate container-padding">
			{#each trails as trail, index (index)}
				<button
					class="item"
					style="--height: {trail.getHeight()}px; --align: {computeAlign()}"
					onclick={() => toggleTrailView(index)}
				>
					<div class="enumerate-item">
						<span>{index + 1}.</span>
					</div>
				</button>
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
							showCAView={caConstraint && trail.view()}
							showUPView={upConstraint && trail.view()}
						/>
					</div>
				{/each}
			</editor-trails>
		</trails-leaf>

		<editor-info class="container-padding">
			{#each trails as trail, index (index)}
				<div class="item">
					<InformationComponent {trail} isLast={trails.length === index + 1} />
				</div>
			{/each}
		</editor-info>
	</editor-leaf>
</trail-editor>

<style>
	trail-editor {
		display: block;
		height: 75%;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1.5rem 0.5rem;
		height: calc(100% - var(--debugger-height) - var(--solving-info-height));
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

	.item span {
		opacity: var(--opacity-50);
	}

	.container-padding {
		padding: 1rem 0rem;
	}
</style>

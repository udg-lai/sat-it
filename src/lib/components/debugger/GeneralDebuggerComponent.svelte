<script lang="ts">
	import { browser } from '$app/environment';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		stateMachineEventBus,
		toggleTrailExpandEventBus,
		userActionEventBus
	} from '$lib/events/events.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import {
		getTrailsExpanded,
		setTrailsExpanded
	} from '$lib/states/decision-levels-expanded.svelte.ts';
	import { getStackLength, getStackPointer } from '$lib/states/stack.svelte.ts';
	import {
		ArrowRightOutline,
		BarsOutline,
		ChevronLeftOutline,
		ChevronRightOutline,
		ReplyOutline
	} from 'flowbite-svelte-icons';
	import { onDestroy, onMount } from 'svelte';
	import ResetProblem from './ResetProblemDebuggerComponent.svelte';
	import './style.css';

	interface Props {
		finished: boolean;
		backtrackingState: boolean;
	}

	let { finished, backtrackingState }: Props = $props();

	let expanded = $derived(getTrailsExpanded());
	let textCollapse = $derived(expanded ? 'Collapse propagations' : 'Expand propagations');

	let btnRedoActive = $derived(getStackPointer() < getStackLength() - 1);
	let btnUndoActive = $derived(getStackPointer() > 0);

	const generalProps = {
		size: 'md'
	};

	const reverseProps = {
		class: 'transform -scale-x-100',
		size: 'md'
	};

	onMount(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeyDown);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});

	function toggleExpand() {
		setTrailsExpanded(!expanded);
	}

	function handleKeyDown(event: KeyboardEvent) {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

		const isUndo =
			(isMac && event.metaKey && event.key === 'z') ||
			(!isMac && event.ctrlKey && event.key === 'z');

		const isRedo =
			(isMac && event.metaKey && event.shiftKey && event.key.toLowerCase() === 'z') ||
			(!isMac && event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z');

		if (isUndo) {
			event.preventDefault();
			userActionEventBus.emit('undo');
		} else if (isRedo) {
			event.preventDefault();
			userActionEventBus.emit('redo');
		}
	}
</script>

<general-debugger>
	<button
		class="btn general-btn"
		class:invalidOption={finished || backtrackingState}
		title="Solve trail"
		onclick={() => {
			updateAssignment('automated');
			stateMachineEventBus.emit('solve_trail');
			userActionEventBus.emit('record');
			toggleTrailExpandEventBus.emit(true);
		}}
		disabled={finished || backtrackingState}
	>
		<DynamicRender component={ArrowRightOutline} props={generalProps} />
	</button>

	<button
		class="btn general-btn"
		class:invalidOption={finished || backtrackingState}
		title="Solve"
		onclick={() => {
			updateAssignment('automated');
			stateMachineEventBus.emit('solve_all');
			userActionEventBus.emit('record');
			toggleTrailExpandEventBus.emit(true);
		}}
		disabled={finished || backtrackingState}
	>
		<DynamicRender component={BarsOutline} props={generalProps} />
	</button>

	<ResetProblem />

	<button
		class="btn general-btn"
		class:invalidOption={!btnUndoActive}
		title="Undo"
		disabled={!btnUndoActive}
		onclick={() => userActionEventBus.emit('undo')}
	>
		<DynamicRender component={ReplyOutline} props={generalProps} />
	</button>

	<button
		class="btn general-btn"
		class:invalidOption={!btnRedoActive}
		title="Redo"
		onclick={() => userActionEventBus.emit('redo')}
		disabled={!btnRedoActive}
	>
		<DynamicRender component={ReplyOutline} props={reverseProps} />
	</button>

	<button class="btn general-btn" title={textCollapse} onclick={toggleExpand}>
		<DynamicRender
			component={expanded ? ChevronLeftOutline : ChevronRightOutline}
			props={generalProps}
		/>
	</button>
</general-debugger>

<style>
	general-debugger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>

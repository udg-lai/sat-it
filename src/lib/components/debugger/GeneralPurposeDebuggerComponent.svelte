<script lang="ts">
	import ResetProblem from './buttons/ResetProblemComponent.svelte';
	import { userActionEventBus } from '$lib/events/events.ts';
	import { getStackLength, getStackPointer } from '$lib/states/stack.svelte.ts';
	import {
		getTrailsExpanded,
		setTrailsExpanded
	} from '$lib/states/decision-levels-expanded.svelte.ts';
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import './style.css';
	import UndoComponent from './buttons/UndoComponent.svelte';
	import RedoComponent from './buttons/RedoComponent.svelte';
	import ExpColTrailComponent from './buttons/ExpColTrailComponent.svelte';

	let expanded = $derived(getTrailsExpanded());
	let btnRedoActive = $derived(getStackPointer() < getStackLength() - 1);
	let btnUndoActive = $derived(getStackPointer() > 0);

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
</script>

<ResetProblem />

<UndoComponent {btnUndoActive} />

<RedoComponent {btnRedoActive} />

<ExpColTrailComponent {expanded} {toggleExpand} />

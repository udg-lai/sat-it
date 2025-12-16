<script lang="ts">
	import { browser } from '$app/environment';
	import { algorithmicUndoEventBus } from '$lib/events/events.ts';
	import {
		getTrailsExpanded,
		setTrailsExpanded
	} from '$lib/states/decision-levels-expanded.svelte.ts';
	import { getDecisions } from '$lib/states/decisions.svelte.ts';
	import { onDestroy, onMount } from 'svelte';
	import ExpColTrailComponent from './buttons/ExpColTrailComponent.svelte';
	import ResetProblem from './buttons/ResetProblemComponent.svelte';
	import UndoComponent from './buttons/UndoComponent.svelte';
	import './style.css';
	import { getLatestTrail } from '$lib/states/trails.svelte.ts';

	let expanded = $derived(getTrailsExpanded());
	let btnUndoActive = $derived(getDecisions().length > 0);

	function toggleExpand() {
		setTrailsExpanded(!expanded);
	}

	function handleKeyDown(event: KeyboardEvent) {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

		const isUndo =
			(isMac && event.metaKey && event.key === 'z') ||
			(!isMac && event.ctrlKey && event.key === 'z');

		if (isUndo) {
			event.preventDefault();
			// We undo the last decision
			algorithmicUndoEventBus.emit({
				decision: getLatestTrail().getDecisions()[-1],
				trailIndex: getDecisions().length
			});
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

<ExpColTrailComponent {expanded} {toggleExpand} />

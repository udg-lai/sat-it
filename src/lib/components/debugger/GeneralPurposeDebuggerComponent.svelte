<script lang="ts">
	import { browser } from '$app/environment';
	import { ctrlZEventBus } from '$lib/events/events.ts';
	import { getDecisions } from '$lib/states/trail-decisions.svelte.ts';
	import { onDestroy, onMount } from 'svelte';
	import ExpColTrailComponent from './buttons/ExpColTrailComponent.svelte';
	import ResetProblem from './buttons/ResetProblemComponent.svelte';
	import UndoComponent from './buttons/UndoComponent.svelte';
	import './style.css';

	let btnUndoActive = $derived(getDecisions().length > 0);

	function handleKeyDown(event: KeyboardEvent) {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

		const isUndo =
			(isMac && event.metaKey && event.key === 'z') ||
			(!isMac && event.ctrlKey && event.key === 'z');

		if (isUndo) {
			event.preventDefault();
			ctrlZEventBus.emit();
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

<ExpColTrailComponent />

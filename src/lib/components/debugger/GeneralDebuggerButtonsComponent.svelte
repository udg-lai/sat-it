<script lang="ts">
	import './_style.css';

	import { onDestroy, onMount } from 'svelte';
	import { emitActionEvent, emitEditorViewEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		ArrowRightOutline,
		BarsOutline,
		ChevronLeftOutline,
		ChevronRightOutline,
		ReplyOutline
	} from 'flowbite-svelte-icons';
	import { getStackLength, getStackPointer } from '$lib/store/stack.svelte.ts';
	import { browser } from '$app/environment';

	let expanded = $state(false);
	let textCollapse = $derived(expanded ? 'Collapse Propagations' : 'Expand Propagations');

	let btnRedoActive = $derived(getStackPointer() < getStackLength() - 1);
	let btnUndoActive = $derived(getStackPointer() > 0);

	const generalProps = {
		class: 'h-8 w-8'
	};

	const reverseProps = {
		class: 'h-8 w-8 transform -scale-x-100'
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
		expanded = !expanded;
		emitEditorViewEvent();
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
			emitActionEvent('undo' );
		} else if (isRedo) {
			event.preventDefault();
			emitActionEvent('redo');
		}
	}
</script>

<button class="btn general-btn" title="Solve trail">
	<DynamicRender component={ArrowRightOutline} props={generalProps} />
</button>

<button class="btn general-btn" title="Solve">
	<DynamicRender component={BarsOutline} props={generalProps} />
</button>

<button
	class="btn general-btn"
	class:invalidOption={!btnUndoActive}
	title="Undo"
	disabled={!btnUndoActive}
	onclick={() => emitActionEvent('undo')}
>
	<DynamicRender component={ReplyOutline} props={generalProps} />
</button>

<button
	class="btn general-btn"
	class:invalidOption={!btnRedoActive}
	title="Redo"
	onclick={() => emitActionEvent('redo')}
	disabled={!btnRedoActive}
>
	<DynamicRender component={ReplyOutline} props={reverseProps} />
</button>

<button class="btn general-btn" title={textCollapse} onclick={toggleExpand}>
	<DynamicRender
		component={expanded ? ChevronRightOutline : ChevronLeftOutline}
		props={generalProps}
	/>
</button>

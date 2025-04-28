<script lang="ts">
	import './style.css';

	import { onDestroy, onMount } from 'svelte';
	import { emitEditorViewEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		ArrowRightOutline,
		BarsOutline,
		ChevronLeftOutline,
		ChevronRightOutline,
		ReplyOutline
	} from 'flowbite-svelte-icons';
	import { redo, undo, userActions, userActionsPointer } from '$lib/store/action.store.ts';
	import { browser } from '$app/environment';

	let expanded = $state(false);
	let textCollapse = $derived(expanded ? 'Collapse Propagations' : 'Expand Propagations');

	let activateRedo = $derived.by(() => {
		const pointerValue = $userActionsPointer + 1;
		const stackSize = $userActions.length;
		return pointerValue < stackSize;
	});

	const generalProps = {
		class: 'h-8 w-8'
	};
	const reverseProps = {
		class: 'h-8 w-8 transform -scale-x-100'
	};

	onMount(() => {
		emitEditorViewEvent(expanded);
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
		emitEditorViewEvent(expanded);
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
			undo();
		} else if (isRedo) {
			event.preventDefault();
			console.log('Hola');
			redo();
		}
	}
</script>

<button class="btn general-btn" title="Solve trail">
	<DynamicRender component={ArrowRightOutline} props={generalProps} />
</button>

<button class="btn general-btn" title="Solve">
	<DynamicRender component={BarsOutline} props={generalProps} />
</button>

<button class="btn general-btn" title="Undo" onclick={undo}>
	<DynamicRender component={ReplyOutline} props={generalProps} />
</button>

<button
	class="btn general-btn"
	class:invalidOption={!activateRedo}
	title="Redo"
	onclick={redo}
	disabled={!activateRedo}
>
	<DynamicRender component={ReplyOutline} props={reverseProps} />
</button>

<button class="btn general-btn" title={textCollapse} onclick={toggleExpand}>
	<DynamicRender
		component={expanded ? ChevronLeftOutline : ChevronRightOutline}
		props={generalProps}
	/>
</button>

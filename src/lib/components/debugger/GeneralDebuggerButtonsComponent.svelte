<script lang="ts">
	import './style.css';

	import { onDestroy, onMount } from 'svelte';
	import { emitEditorViewEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		ArrowRightOutline,
		BarsOutline,
		CaretDownOutline,
		CaretUpOutline,
		ReplyOutline
	} from 'flowbite-svelte-icons';
	import { redo, undo } from '$lib/store/action.store.ts';
	import { browser } from '$app/environment';

	let expanded = $state(true);
	let textCollapse = $derived(expanded ? 'Collaps trails' : 'Expand Trails');

	const generalProps = {
		class: 'h-8 w-8 cursor-pointer'
	};

	onMount(() => {
		emitEditorViewEvent(expanded);
		if(browser) {
			window.addEventListener('keydown', handleKeyDown);
		}
		
	});

	onDestroy(() => {
		if(browser) {
			window.removeEventListener('keydown', handleKeyDown);
		}
	})

	function toggleExpand() {
		expanded = !expanded;
		emitEditorViewEvent(expanded);
	}

	function handleKeyDown(event: KeyboardEvent) {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

		const isUndo = (isMac && event.metaKey && event.key === 'z') ||
									 (!isMac && event.ctrlKey && event.key === 'z');

		const isRedo = (isMac && event.metaKey && event.shiftKey && event.key.toLowerCase() === 'z') ||
                   (!isMac && event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z');
		if(isUndo) {
			event.preventDefault();
			undo();
		} 
		else if(isRedo) {
			event.preventDefault();
			console.log("Hola");
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

<button class="btn general-btn" title={textCollapse} onclick={toggleExpand}>
	<DynamicRender component={expanded ? CaretUpOutline : CaretDownOutline} props={generalProps} />
</button>

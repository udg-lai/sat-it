<script lang="ts">
	import './style.css';

	import { onMount } from 'svelte';
	import { emitEditorViewEvent } from './events.svelte.ts';
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		ArrowRightOutline,
		BarsOutline,
		ChevronLeftOutline,
		ChevronRightOutline,
		ReplyOutline
	} from 'flowbite-svelte-icons';

	let expanded = $state(true);
	let textCollapse = $derived(expanded ? 'Collaps Propagations' : 'Expand Propagations');

	const generalProps = {
		class: 'h-8 w-8 cursor-pointer'
	};

	onMount(() => {
		emitEditorViewEvent(expanded);
	});

	function toggleExpand() {
		expanded = !expanded;
		emitEditorViewEvent(expanded);
	}
</script>

<button class="btn general-btn" title="Solve trail">
	<DynamicRender component={ArrowRightOutline} props={generalProps} />
</button>

<button class="btn general-btn" title="Solve">
	<DynamicRender component={BarsOutline} props={generalProps} />
</button>

<button class="btn general-btn" title="Undo">
	<DynamicRender component={ReplyOutline} props={generalProps} />
</button>

<button class="btn general-btn" title={textCollapse} onclick={toggleExpand}>
	<DynamicRender
		component={expanded ? ChevronLeftOutline : ChevronRightOutline}
		props={generalProps}
	/>
</button>

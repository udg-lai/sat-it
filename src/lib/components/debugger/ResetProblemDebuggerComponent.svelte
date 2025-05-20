<script>
	import { RefreshOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { changeInstanceEventBus } from '$lib/transversal/events.ts';
	const resetProps = {
		class: 'h-8 w-8'
	};
</script>

<button
	class="btn general-btn"
	title="Reset"
	onclick={() => {
		changeInstanceEventBus.emit();
	}}
>
	<DynamicRender component={RefreshOutline} props={resetProps} />
</button>

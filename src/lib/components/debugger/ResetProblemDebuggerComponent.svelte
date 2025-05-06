<script>
	import { RefreshOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	const resetProps = {
		class: 'h-8 w-8'
	};
</script>

<button class="btn general-btn" title="Reset">
	<DynamicRender component={RefreshOutline} props={resetProps} />
</button>

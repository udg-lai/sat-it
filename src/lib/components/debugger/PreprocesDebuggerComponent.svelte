<script lang="ts">
	import './_style.css';
	import { CaretRightOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { preprocessSignalEventBus } from '$lib/transversal/events.ts';

	const assignmentProps = {
		class: 'h-8 w-8'
	};
</script>

<button
	class="btn general-btn"
	onclick={() => {
		preprocessSignalEventBus.emit();
	}}
	title="Start Preproces"
>
	<DynamicRender component={CaretRightOutline} props={assignmentProps} />
</button>

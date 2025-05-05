<script lang="ts">
	import './_style.css';
	import { CaretRightOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { preprocesSignalEventBus } from '$lib/transversal/events.ts';

	const assignmentProps = {
		class: 'h-8 w-8'
	};
</script>

<button
	class="btn general-btn"
	onclick={() => {
		preprocesSignalEventBus.emit();
	}}
	title="Start Preproces"
>
	<DynamicRender component={CaretRightOutline} props={assignmentProps} />
</button>

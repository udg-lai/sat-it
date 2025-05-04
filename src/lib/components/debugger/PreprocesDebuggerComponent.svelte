<script lang="ts">
	import './_style.css';
	import { CaretRightOutline } from 'flowbite-svelte-icons';
	import DynamicRender from '../DynamicRender.svelte';
	import { emitPreprocesEvent } from './events.svelte.ts';

	const assignmentProps = {
		class: 'h-8 w-8'
	};
</script>

<button
	class="btn general-btn"
	onclick={() => {
		emitPreprocesEvent({ type: 'start' });
	}}
	title="Begin"
>
	<DynamicRender component={CaretRightOutline} props={assignmentProps} />
</button>

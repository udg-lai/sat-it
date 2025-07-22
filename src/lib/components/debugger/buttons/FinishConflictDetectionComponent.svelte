<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { ChevronDoubleRightOutline } from 'flowbite-svelte-icons';
	import '../style.css';
</script>

<button
	class="btn general-btn"
	title="Finish CD"
	onclick={() => {
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('finishCD');
	}}
>
	<DynamicRender component={ChevronDoubleRightOutline} props={{ size: 'md' }} />
</button>

<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { ForwardOutline } from 'flowbite-svelte-icons';
	import '../style.css';
</script>

<button
	class="btn general-btn"
	title="Next variable"
	onclick={() => {
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('nextVariable');
	}}
>
	<DynamicRender component={ForwardOutline} props={{ size: 'md' }} />
</button>

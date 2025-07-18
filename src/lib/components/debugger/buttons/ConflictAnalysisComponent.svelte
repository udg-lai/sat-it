<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { ForwardOutline } from 'flowbite-svelte-icons';
	import '../style.css';
</script>

<button
	class="btn general-btn conflict-btn"
	title="Finish Conflict Analysis"
	onclick={() => {
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('finishCA');
	}}
>
	<DynamicRender component={ForwardOutline} props={{ size: 'md' }} />
</button>

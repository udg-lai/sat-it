<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		stateMachineEventBus,
		toggleTrailExpandEventBus,
		updateTrailsEventBus
	} from '$lib/events/events.ts';
	import { ForwardOutline } from 'flowbite-svelte-icons';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
</script>

<button
	class="btn general-btn conflict-btn"
	title="Finish Conflict Analysis"
	onclick={() => {
		getSolverMachine().disableStops();
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('finishCA');
		updateTrailsEventBus.emit();
	}}
>
	<DynamicRender component={ForwardOutline} props={{ size: 'md' }} />
</button>

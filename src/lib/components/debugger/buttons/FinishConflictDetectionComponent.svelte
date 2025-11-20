<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import {
		stateMachineEventBus,
		toggleTrailExpandEventBus,
		updateTrailsEventBus
	} from '$lib/events/events.ts';
	import { ChevronDoubleRightOutline } from 'flowbite-svelte-icons';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
</script>

<button
	class="btn general-btn"
	title="Finish CD"
	onclick={() => {
		getSolverMachine().disableStops();
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('finishCD');
		updateTrailsEventBus.emit();
	}}
>
	<DynamicRender component={ChevronDoubleRightOutline} props={{ size: 'md' }} />
</button>

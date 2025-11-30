<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { ForwardOutline } from 'flowbite-svelte-icons';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	function goToNextVariable(): void {
		getSolverMachine().disableStops();
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('nextVariable');
	}
</script>

<button class="btn general-btn" title="Next variable" onclick={goToNextVariable}>
	<DynamicRender component={ForwardOutline} props={{ size: 'md' }} />
</button>

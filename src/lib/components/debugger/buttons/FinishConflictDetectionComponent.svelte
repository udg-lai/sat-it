<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import { ChevronDoubleRightOutline } from 'flowbite-svelte-icons';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';

	function finishConflictDetection(): void {
		getSolverMachine().disableStops();
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('finishCD');
	}
</script>

<button class="btn general-btn" title="Finish CD" onclick={finishConflictDetection}>
	<DynamicRender component={ChevronDoubleRightOutline} props={{ size: 'md' }} />
</button>

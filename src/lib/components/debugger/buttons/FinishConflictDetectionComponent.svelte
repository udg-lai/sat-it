<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import upn from '$lib/icons/UPn.svg';

	function finishConflictDetection(): void {
		getSolverMachine().disableStops();
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('finishCD');
	}
</script>

<button class="btn general-btn" title="Finish CD" onclick={finishConflictDetection}>
	<ImageRender icon={upn} alt="Finish UPs" />
</button>

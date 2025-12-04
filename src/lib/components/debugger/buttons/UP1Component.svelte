<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import up1 from '$lib/icons/UP1.svg';

	function finishConflictDetection(): void {
		getSolverMachine().disableStops();
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('up1');
	}
</script>

<button class="btn general-btn" title="One Unit Propagation" onclick={finishConflictDetection}>
	<ImageRender icon={up1} alt="up1" />
</button>

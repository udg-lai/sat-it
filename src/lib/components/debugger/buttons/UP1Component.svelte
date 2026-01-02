<script lang="ts">
	import { solverCommandEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	let up1Icon = '/icons/UP1.svg';

	function finishConflictDetection(): void {
		getSolverMachine().disableStepDelay();
		toggleTrailExpandEventBus.emit(true);
		solverCommandEventBus.emit('up1');
	}
</script>

<button class="btn general-btn" title="One Unit Propagation" onclick={finishConflictDetection}>
	<ImageRender icon={up1Icon} alt="up1" />
</button>

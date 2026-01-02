<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	import { solverCommandEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';

	let backtrackingIcon = '/icons/Backtracking.svg';

	function finishConflictAnalysis(): void {
		getSolverMachine().disableStepDelay();
		toggleTrailExpandEventBus.emit(true);
		solverCommandEventBus.emit('finishCA');
	}
</script>

<button
	class="btn general-btn conflict-btn"
	title="Finish Conflict Analysis"
	onclick={finishConflictAnalysis}
>
	<ImageRender icon={backtrackingIcon} alt="Resolve Conflict" />
</button>

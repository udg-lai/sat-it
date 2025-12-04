<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	import backtracking from '$lib/icons/Backtracking.svg'
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';

	function finishConflictAnalysis(): void {
		getSolverMachine().disableStops();
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('finishCA');
	}
</script>

<button
	class="btn general-btn conflict-btn"
	title="Finish Conflict Analysis"
	onclick={finishConflictAnalysis}
>
	<ImageRender icon={backtracking} alt="Resolve Conflict" />
</button>

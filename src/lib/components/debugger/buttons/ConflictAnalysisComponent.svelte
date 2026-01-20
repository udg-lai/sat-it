<script lang="ts">
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	import { solverCommandEventBus, expandEditorTrailsEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';

	import { asset } from '$app/paths';

	let backtrackingIcon = asset('/icons/Backtracking.svg');

	function finishConflictAnalysis(): void {
		getSolverMachine().disableStepDelay();
		expandEditorTrailsEventBus.emit(true);
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

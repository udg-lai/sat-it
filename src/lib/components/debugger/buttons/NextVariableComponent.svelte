<script lang="ts">
	import { solverCommandEventBus, expandEditorTrailsEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import ImageRender from '$lib/components/tools/ImageRender.svelte';

	let nextClauseIcon = '/icons/Inspect All Clauses.svg';

	function goToNextVariable(): void {
		getSolverMachine().disableStepDelay();
		expandEditorTrailsEventBus.emit(true);
		solverCommandEventBus.emit('nextVariable');
	}
</script>

<button class="btn general-btn" title="Inspect all clauses" onclick={goToNextVariable}>
	<ImageRender icon={nextClauseIcon} alt="Inspect all clauses" />
</button>

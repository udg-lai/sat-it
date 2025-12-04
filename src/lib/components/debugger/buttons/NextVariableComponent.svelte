<script lang="ts">
	import { stateMachineEventBus, toggleTrailExpandEventBus } from '$lib/events/events.ts';
	import '../style.css';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import nextClause from '$lib/icons/Inspect All Clauses.svg'
	import ImageRender from '$lib/components/tools/ImageRender.svelte';
	
	function goToNextVariable(): void {
		getSolverMachine().disableStops();
		toggleTrailExpandEventBus.emit(true);
		stateMachineEventBus.emit('nextVariable');
	}
</script>

<button class="btn general-btn" title="Inspect all clauses" onclick={goToNextVariable}>
	<ImageRender icon={nextClause} alt="Inspect all clauses" />
</button>

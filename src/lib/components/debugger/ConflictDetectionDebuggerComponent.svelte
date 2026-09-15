<script lang="ts">
	import StepComponent from './buttons/StepComponent.svelte';
	import NextVariableComponent from './buttons/NextVariableComponent.svelte';
	import { asset } from '$app/paths';
	import { solverCommandEventBus, visitingComplementaryOccEventBus } from '$lib/events/events.ts';

	let inspectClauseIcon = asset('/icons/Inspect Next Clause.svg');

	function initStep(): void {
		solverCommandEventBus.emit('step');
		visitingComplementaryOccEventBus.emit();
	}
</script>

<conflict-detection-debugger>
	<StepComponent icon={inspectClauseIcon} alt="Inspect next clause" onClick={initStep} />

	<NextVariableComponent />
</conflict-detection-debugger>

<style>
	conflict-detection-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>

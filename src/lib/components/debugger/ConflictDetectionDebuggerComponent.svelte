<script lang="ts">
	import StepComponent from './buttons/StepComponent.svelte';
	import NextVariableComponent from './buttons/NextVariableComponent.svelte';
	import { asset } from '$app/paths';

	let inspectClauseIcon = asset('/icons/Inspect Next Clause.svg');
</script>

<conflict-detection-debugger>
	<StepComponent icon={inspectClauseIcon} alt="Inspect next clause" />

	<NextVariableComponent />
</conflict-detection-debugger>

<style>
	conflict-detection-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>

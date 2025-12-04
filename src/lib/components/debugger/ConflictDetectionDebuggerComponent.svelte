<script lang="ts">
	import StepComponent from './buttons/StepComponent.svelte';
	import NextVariableComponent from './buttons/NextVariableComponent.svelte';
	import inspectClause from '$lib/icons/Inspect Next Clause.svg';
</script>

<conflict-detection-debugger>
	<StepComponent icon={inspectClause} alt="Inspect next clause" />

	<NextVariableComponent />
</conflict-detection-debugger>

<style>
	conflict-detection-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>

<script lang="ts">
	import StepComponent from './buttons/StepComponent.svelte';
	import NextVariableComponent from './buttons/NextVariableComponent.svelte';
	import FinishConflictDetectionComponent from './buttons/FinishConflictDetectionComponent.svelte';
</script>

<conflict-detection-debugger>
	<StepComponent />

	<NextVariableComponent />

	<FinishConflictDetectionComponent />
</conflict-detection-debugger>

<style>
	conflict-detection-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>

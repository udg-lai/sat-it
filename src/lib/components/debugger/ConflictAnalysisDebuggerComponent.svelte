<script lang="ts">
	import ConflictAnalysisComponent from './buttons/ConflictAnalysisComponent.svelte';
	import StepComponent from './buttons/StepComponent.svelte';
</script>

<conflict-analysis-debugger>
	<StepComponent />

	<ConflictAnalysisComponent />
</conflict-analysis-debugger>

<style>
	conflict-analysis-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>

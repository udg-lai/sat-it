<script lang="ts">
	import ConflictAnalysisComponent from './buttons/ConflictAnalysisComponent.svelte';
	import StepComponent from './buttons/StepComponent.svelte';
	
	let resolutionIcon = '/icons/Resolution.svg';
</script>

<conflict-analysis-debugger>
	<StepComponent myClass={'conflict-btn'} icon={resolutionIcon} alt="Resolve following clause" />

	<ConflictAnalysisComponent />
</conflict-analysis-debugger>

<style>
	conflict-analysis-debugger {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>

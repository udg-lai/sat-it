<script lang="ts">
	import AlgorithmComponent from './AlgorithmComponent.svelte';
	import BreakpointsComponent from './BreakpointsComponent.svelte';
	import ParametersComponent from './ParametersComponent.svelte';

	const iconClass = { size: 'xl' };
</script>

<div class="content-container">
	<AlgorithmComponent {iconClass} />
</div>
<div class="division-container"></div>
<div class="content-container">
	<BreakpointsComponent {iconClass} />
</div>
<div class="division-container"></div>
<div class="content-container">
	<ParametersComponent {iconClass} />
</div>

<style>
	.division-container {
		height: 100%;
		width: 2px;
		background-color: var(--border-color);
	}
	.content-container {
		height: 100%;
		display: flex;
		flex: 1;
		flex-direction: column;
	}
</style>

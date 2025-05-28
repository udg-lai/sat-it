<script lang="ts">
	import AlgorithmComponent from './engine/AlgorithmComponent.svelte';
	import BreakingpointComponent from './engine/BreakingpointComponent.svelte';
	import ParametersComponent from './engine/PrametersComponent.svelte';

	const iconClass = { size: 'xl' };
</script>

<div class="container">
	<div class="content-container">
		<AlgorithmComponent {iconClass} />
	</div>
	<div class="division-container"></div>
	<div class="content-container">
		<BreakingpointComponent {iconClass} />
	</div>
	<div class="division-container"></div>
	<div class="content-container">
		<ParametersComponent {iconClass} />
	</div>
</div>

<style>
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: row;
	}
	.division-container {
		height: 100%;
		width: 2px;
		background-color: var(--border-color);
	}
	.content-container {
		display: flex;
		flex: 1;
		flex-direction: column;
	}
</style>

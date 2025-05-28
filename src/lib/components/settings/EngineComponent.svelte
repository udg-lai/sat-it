<script lang="ts">
	import AlgorithmComponent from './engine/AlgorithmComponent.svelte';
	import BreakingpointComponent from './engine/BreakingpointComponent.svelte';
	import ParametersComponent from './engine/PrametersComponent.svelte';

	const headingClass: string =
		'h-20 w-full flex items-center justify-center gap-2 text-md border-b';
	const iconClass = { size: 'xl' };
	const bodyClass: string = 'h-full w-full p-4 flex flex-col gap-3 overflow-hidden';
</script>

<div class="container">
	<div class="content-container">
		<AlgorithmComponent {headingClass} {iconClass} {bodyClass} />
	</div>
	<div class="divsion-container"></div>
	<div class="content-container">
		<BreakingpointComponent {headingClass} {iconClass} {bodyClass} />
	</div>
	<div class="divsion-container"></div>
	<div class="content-container">
		<ParametersComponent {headingClass} {iconClass} {bodyClass} />
	</div>
</div>

<style>
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: row;
	}
	.divsion-container {
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

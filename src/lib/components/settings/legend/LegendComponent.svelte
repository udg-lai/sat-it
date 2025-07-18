<script lang="ts">
	import ButtonsLegend from './ButtonsLegendComponent.svelte';
	import TrailLegend from './TrailLegendComponent.svelte';
	import ToolsLegend from './ToolsLegendComponent.svelte';
</script>

<div class="content-container">
	<ButtonsLegend />
</div>
<div class="division-container"></div>
<div class="content-container">
	<TrailLegend />
</div>
<div class="division-container"></div>
<div class="content-container">
	<ToolsLegend />
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

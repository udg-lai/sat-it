<script lang="ts">
	import ButtonsLegend from './ButtonsLegendComponent.svelte';
	import ToolsLegend from './ToolsLegendComponent.svelte';
	import TrailLegend from './TrailLegendComponent.svelte';
	import AcknowledgementsComponent from './AcknowledgementsComponent.svelte';
</script>

<legend-view>
	<legend>
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
	</legend>
	<acknowledge>
		<AcknowledgementsComponent />
	</acknowledge>
</legend-view>

<style>
	legend-view {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
	legend {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: calc(100% - 50px);
	}
	acknowledge {
		height: 50px;
		width: 100%;
		display: flex;
		border-top: 1px solid var(--border-color);
		align-items: center;
		background-color: var(--main-bg-color);
	}
	.division-container {
		height: 100%;
		width: 2px;
		background-color: var(--border-color);
	}
	.content-container {
		height: 100%;
		width: calc(33.33% - 4px);
		display: flex;
		flex-direction: column;
	}
</style>

<script lang="ts">
	import LogicResolutionComponent from "./LogicResolutionComponent.svelte";
	import ToolsComponent from "./ToolsComponent.svelte";

</script>

<div class="grid-container">
	<ToolsComponent isOpen={true} --width="max(200px, 20vw)" />
	<workspace class="flex flex-col md:flex-row">
		<trail></trail>
		<play-area>
			<scrollable-area>
				<LogicResolutionComponent />
			</scrollable-area>
		</play-area>
	</workspace>
</div>

<style>
	trail, play-area {
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	trail {
		background-color: yellow;
		flex: 1;
	}

	play-area {
		background-color: blue;
		flex: 2;
		position: relative;
	}

	scrollable-area {
		position: absolute;
		min-height: calc(100% - 2rem);
		min-width: calc(100% - 2rem);
	}

	workspace {
		flex: auto;
	}

	.grid-container {
		display: flex;
		height: 100%;
	}
</style>

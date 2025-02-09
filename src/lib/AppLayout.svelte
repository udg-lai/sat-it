<script lang="ts">
	import ToolsComponent from "./ToolsComponent.svelte";

</script>

<div class="grid-container">
	<ToolsComponent isOpen={true} --width="max(200px, 20vw)" />
	<workspace class="flex flex-col md:flex-row">
		<trail></trail>
		<play-area></play-area>
	</workspace>
</div>

<style>
	trail, play-area {
		align-items: center;
		justify-content: center;
		flex: auto;
	}

	trail {
		background-color: yellow;
	}

	play-area {
		background-color: blue;
	}

	workspace {
		flex: auto;
	}

	.grid-container {
		display: flex;
		height: 100%;
	}
</style>

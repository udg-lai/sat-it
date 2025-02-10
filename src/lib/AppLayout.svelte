<script lang="ts">
	import FooterComponent from "$lib/FooterComponent.svelte";
import LogicResolutionComponent from "$lib/LogicResolutionComponent.svelte";
	import ToolsComponent from "$lib/ToolsComponent.svelte";

</script>

<div class="view-container">
	<div class="app-container">
		<div class="z-10 tools-section">
			<ToolsComponent hide={false} --width="max(var(--min-width-tools), var(--max-width-tools))" />
		</div>
		<workspace class="flex flex-col md:flex-row">
			<play-area>
				<scrollable-area>
					<LogicResolutionComponent />
				</scrollable-area>
			</play-area>
		</workspace>
	</div>
	<div class="footer-section">
		<FooterComponent />
	</div>
</div>


<style>
	trail, play-area {
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	trail {
		flex: 1;
	}

	play-area {
		flex: 2;
		position: relative;
	}

	scrollable-area {
		position: absolute;
		height: 100%;
		max-height: calc(100% - 2rem);
		max-width: calc(100% - 2rem);
		overflow: auto;
	}

	workspace {
		flex: auto;
	}

	.app-container {
		display: flex;
		height: 100%;
	}

	.view-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	.tools-section {
        border-width: 0px 1px 0px 0px;
        border-color: var(--border-color);
	}

	.footer-section {
    border-width: 1px 0px 0px 0px;
    border-color: var(--border-color);
	}
</style>

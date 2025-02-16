<script lang="ts">
	import FooterComponent from '$lib/FooterComponent.svelte';
	import LogicResolutionComponent from '$lib/LogicResolutionComponent.svelte';
	import ToolsComponent from '$lib/ToolsComponent.svelte';
	import ScrollableComponent from '$lib/ScrollableComponent.svelte';
</script>

<div class="view-container">
	<div class="app-container">
		<div class="tools-section z-10">
			<ToolsComponent hide={false} --width="max(var(--min-width-tools), var(--max-width-tools))" />
		</div>
		<workspace class="flex flex-col md:flex-row">
			<play-area>
				<ScrollableComponent component={logicResolution}/>
			</play-area>
		</workspace>
	</div>
	<div class="footer-section">
		<FooterComponent />
	</div>
</div>


{#snippet logicResolution(props?: {string: any})}
	<LogicResolutionComponent />
{/snippet}

<style>
	trail,
	play-area {
		align-items: center;
		justify-content: center;
		padding: var(--windows-padding);
	}

	trail {
		flex: 1;
	}

	play-area {
		flex: 2;
		position: relative;
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

<script lang="ts">
	import FooterComponent from '$lib/components/FooterComponent.svelte';
	import LogicResolutionComponent from '$lib/components/LogicResolutionComponent.svelte';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import ScrollableComponent from '$lib/components/ScrollableComponent.svelte';
	import { setContext } from 'svelte';
	import dummy from '$lib/instances/dummy.ts';
	import queens8 from '$lib/instances/queens/queens8.ts';
	import queens4 from '$lib/instances/queens/queens4.ts';
	import type { InstanceDimacs } from '$lib/instances/InstanceDimacs.ts';

	function bootstrapInstances(): void {
		const instances: InstanceDimacs[] = [dummy, queens4, queens8];
		setContext('preloadedInstances', instances);
	}

	bootstrapInstances();
</script>

<div class="view-container">
	<div class="app-container">
		<div class="tools-section z-10">
			<ToolsComponent hide={true} />
		</div>
		<workspace class="flex flex-col md:flex-row">
			<play-area>
				<ScrollableComponent component={logicResolution} />
			</play-area>
		</workspace>
	</div>
	<div class="footer-section">
		<FooterComponent />
	</div>
</div>

{#snippet logicResolution()}
	<LogicResolutionComponent />
{/snippet}

<style>
	play-area {
		align-items: center;
		justify-content: center;
		padding: var(--windows-padding);
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
		position: relative;
	}

	.footer-section {
		border-width: 1px 0px 0px 0px;
		border-color: var(--border-color);
	}
</style>

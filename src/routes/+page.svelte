<script lang="ts">
	import './styles.css';
	import FooterComponent from '$lib/components/FooterComponent.svelte';
	import LogicResolutionComponent from '$lib/components/LogicResolutionComponent.svelte';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import ScrollableComponent from '$lib/components/ScrollableComponent.svelte';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import { disableContextMenu } from '$lib/transversal/utils/utils.ts';
	import { bootstrapInstances } from '$lib/transversal/utils/bootstrap.ts';
	import { toasts } from '$lib/store/toasts.store.ts';

	bootstrapInstances();
</script>

<svelte:body oncontextmenu={disableContextMenu} />

<app class="chakra-petch-medium">
	{#if $toasts}
		<div class="toasts">
			{#each $toasts as toast (toast.id)}
				<ToastComponent {toast} />
			{/each}
		</div>
	{/if}

	<main>
		<div class="tools-section z-10">
			<ToolsComponent hide={true} />
		</div>
		<workspace class="flex flex-col md:flex-row">
			<play-area>
				<ScrollableComponent component={logicResolution} />
			</play-area>
		</workspace>
	</main>
	<footer>
		<FooterComponent />
	</footer>
</app>

{#snippet logicResolution()}
	<LogicResolutionComponent />
{/snippet}

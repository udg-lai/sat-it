<script lang="ts">
	import './styles.css';
	import FooterComponent from '$lib/components/FooterComponent.svelte';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import ScrollableComponent from '$lib/components/ScrollableComponent.svelte';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import { disableContextMenu } from '$lib/transversal/utils/utils.ts';
	import { toasts } from '$lib/store/toasts.store.ts';
	import { initializeInstancesStore, setInstanceToSolve } from '$lib/store/instances.store.ts';
	import { logError } from '$lib/transversal/utils/logging.ts';
	import { onMount } from 'svelte';
	import AppComponent from '$lib/components/AppComponent.svelte';

	onMount(() => {
		initializeInstancesStore()
			.then(() => setInstanceToSolve(0))
			.catch(() =>
				logError(`Preloaded instances`, `Could not fetch preloaded instances correctly`)
			);
	});

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
			<ToolsComponent />
		</div>
		<workspace class="flex flex-col md:flex-row">
			<play-area>
				<ScrollableComponent component={app} />
			</play-area>
		</workspace>
	</main>
	<footer>
		<FooterComponent />
	</footer>
</app>

{#snippet app()}
	<AppComponent />
{/snippet}

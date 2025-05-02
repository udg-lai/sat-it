<script lang="ts">
	import './_styles.css';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import ScrollableComponent from '$lib/components/ScrollableComponent.svelte';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import { toasts } from '$lib/store/toasts.store.ts';
	import {
		initializeInstancesStore,
		setDefaultInstanceToSolve
	} from '$lib/store/instances.store.ts';
	import { onMount } from 'svelte';
	import AppComponent from '$lib/components/AppComponent.svelte';
	import DebuggerComponent from '$lib/components/debugger/DebuggerComponent.svelte';
	import { openViewMoreOptionEventBus } from '$lib/transversal/events.ts';
	import SettingsComponent from '$lib/components/settings/SettingsComponent.svelte';
	import { disableContextMenu } from '$lib/transversal/utils.ts';
	import { logError } from '$lib/transversal/logging.ts';

	let settingsVisible = $state(true);

	onMount(() => {
		initializeInstancesStore()
			.then(setDefaultInstanceToSolve)
			.catch(() =>
				logError(`Preloaded instances`, `Could not fetch preloaded instances correctly`)
			);

		const unsubscribeOpenSettings = openViewMoreOptionEventBus.subscribe(
			() => (settingsVisible = true)
		);

		return () => {
			unsubscribeOpenSettings();
		};
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
		<workspace class="flex flex-col">
			<DebuggerComponent />
			<play-area>
				<ScrollableComponent component={app} />
			</play-area>
		</workspace>
	</main>
</app>

<SettingsComponent bind:visible={settingsVisible} />

{#snippet app()}
	<AppComponent />
{/snippet}

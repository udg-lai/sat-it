<script lang="ts">
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import { toasts } from '$lib/store/toasts.store.ts';
	import {
		initializeInstancesStore,
		setDefaultInstanceToSolve
	} from '$lib/store/instances.store.ts';
	import { onMount } from 'svelte';
	import AppComponent from '$lib/components/AppComponent.svelte';
	import DebuggerComponent from '$lib/components/debugger/DebuggerComponent.svelte';
	import { closeSettingsViewEventBus, openSettingsViewEventBus } from '$lib/transversal/events.ts';
	import SettingsComponent from '$lib/components/settings/SettingsComponent.svelte';
	import { disableContextMenu } from '$lib/transversal/utils.ts';
	import { logError } from '$lib/transversal/logging.ts';
	import { beforeNavigate } from '$app/navigation';

	let renderSettings = $state(true);

	onMount(() => {
		initializeInstancesStore()
			.then(setDefaultInstanceToSolve)
			.catch(() =>
				logError(`Preloaded instances`, `Could not fetch preloaded instances correctly`)
			);

		const unsubscribeOpenSettings = openSettingsViewEventBus.subscribe(
			() => (renderSettings = true)
		);
		const unsubscribeCloseSettings = closeSettingsViewEventBus.subscribe(
			() => (renderSettings = false)
		);

		return () => {
			unsubscribeOpenSettings();
			unsubscribeCloseSettings();
		};
	});

	beforeNavigate((nav) => {
		if (nav.type === 'leave') {
			nav.cancel();
		}
	});
</script>

<svelte:body oncontextmenu={disableContextMenu} />

<main class="chakra-petch-medium">
	{#if $toasts}
		<div class="toasts">
			{#each $toasts as toast (toast.id)}
				<ToastComponent {toast} />
			{/each}
		</div>
	{/if}

	<tools>
		<ToolsComponent />
	</tools>
	<workspace>
		<DebuggerComponent />
		<AppComponent />
	</workspace>
</main>

{#if renderSettings}
	<settings>
		<SettingsComponent />
	</settings>
{/if}

<style>
	main {
		position: relative;
		display: flex;
		flex-direction: row;
		height: 100%;
		width: 100%;
	}

	workspace {
		display: flex;
		flex-direction: column;
		max-height: 100%;
		width: 100%;
	}

	.toasts {
		position: fixed;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: var(--notification-z-index);
	}
</style>

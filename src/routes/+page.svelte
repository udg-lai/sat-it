<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import AppComponent from '$lib/components/AppComponent.svelte';
	import DebuggerComponent from '$lib/components/debugger/DebuggerComponent.svelte';
	import SettingsComponent from '$lib/components/settings/SettingsComponent.svelte';
	import SolvingInformation from '$lib/components/SolvingInformationComponent.svelte';
	import StatisticsComponent from '$lib/components/StatisticsComponent.svelte';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import {
		initializeInstancesStore,
		setDefaultInstanceToSolve
	} from '$lib/store/instances.store.ts';
	import { logError, toasts } from '$lib/store/toasts.ts';
	import { closeSettingsViewEventBus, openSettingsViewEventBus } from '$lib/transversal/events.ts';
	import { disableContextMenu } from '$lib/transversal/utils.ts';
	import { onMount } from 'svelte';

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
		<user>
			<DebuggerComponent />
			<SolvingInformation />
		</user>
		<AppComponent />
	</workspace>
</main>
<footer-component>
	<StatisticsComponent />
</footer-component>

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
		padding-bottom: 3rem;
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

	footer-component {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding-top: 0.25rem;
		padding-bottom: 0.5rem;
		background-color: var(--main-bg-color);
		border-top-width: 1px;
		border-color: var(--border-color);
	}

	user {
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--border-color);
	}
</style>

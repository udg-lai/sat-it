<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import AppComponent from '$lib/components/AppComponent.svelte';
	import SettingsComponent from '$lib/components/settings/SettingsComponent.svelte';
	import ToastComponent from '$lib/components/ToastComponent.svelte';
	import ToolsComponent from '$lib/components/tools/ToolsComponent.svelte';
	import { closeSettingsViewEventBus, openSettingsViewEventBus } from '$lib/events/events.ts';
	import { getToasts } from '$lib/states/toasts.svelte.ts';
	import { disableContextMenu } from '$lib/utils.ts';
	import { onMount } from 'svelte';

	let renderSettings = $state(true);

	const toasts = $derived(getToasts());

	onMount(() => {
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
	{#if toasts}
		<div class="toasts">
			{#each toasts as toast (toast.id)}
				<ToastComponent {toast} />
			{/each}
		</div>
	{/if}
	<ToolsComponent />
	<AppComponent />
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
		flex: 1;
		width: 100%;
		height: 100%;
	}

	.toasts {
		position: fixed;
		bottom: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column-reverse;
		gap: 0.5rem;
		z-index: var(--notification-z-index);
	}
</style>

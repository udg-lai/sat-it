<script lang="ts">
	import { closeSettingsViewEventBus } from '$lib/transversal/events.ts';
	import { fly } from 'svelte/transition';
	import BookmarkInstances from './BookmarkInstances.svelte';
	import EngineComponent from './engine/EngineComponent.svelte';
	import LegendComponent from './LegendComponent.svelte';
	import NavBarComponent, { type OptionEmit } from './NavBarComponent.svelte';
	import { getActiveView, setActiveView } from './settings.store.svelte.ts';

	type ActiveView = 'bookmark' | 'engine' | 'legend' | 'info';

	let view: ActiveView = $derived(getActiveView());

	function handleOptionEvent(event: OptionEmit): void {
		if (event === 'close') {
			closeSettingsViewEventBus.emit();
		} else {
			setActiveView(event);
		}
	}
</script>

<div class="settings" transition:fly={{ y: '100%', duration: 500 }}>
	<div class="setting-view">
		<class class="setting-content">
			{#if view}
				{#if view === 'bookmark'}
					<BookmarkInstances />
				{:else if view === 'engine'}
					<EngineComponent />
				{:else}
					<LegendComponent />
				{/if}
			{/if}
		</class>
	</div>

	<NavBarComponent event={handleOptionEvent} />
</div>

<style>
	.setting-view {
		padding: 1rem max(1rem, 10vw);
		padding-bottom: 0rem;
		max-height: calc(100% - 6rem);
		flex: 1;
		width: 100%;
		display: flex;
	}

	.setting-content {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		border-style: solid;
		border-color: var(--border-color);
		border-width: 1px;
		background-color: #ffff;
	}

	.settings {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background-color: var(--main-bg-color);
		z-index: var(--more-options-z-index);
		display: flex;
	}
</style>

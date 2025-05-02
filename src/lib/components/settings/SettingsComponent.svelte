<script lang="ts">
	import BookmarkInstances from './BookmarkInstances.svelte';
	import OptionsComponent, { type OptionEmit } from './OptionsComponent.svelte';

	type ActiveView = 'bookmark' | 'engine' | 'legend' | 'info';

	interface Props {
		visible: boolean;
	}

	let { visible = $bindable() }: Props = $props();

	let hide = $derived(!visible);

	let view: ActiveView = $state('bookmark');

	function handleOptionEvent(event: OptionEmit): void {
		if (event === 'bookmark') {
			console.log('show list');
		} else if (event === 'engine') {
			console.log('show engine');
		} else {
			console.log('show legend');
		}
		view = event;
	}
</script>

<div class="settings" class:hide-settings={hide}>
	<div class="setting-view">
		<class class="setting-content">
			{#if view}
				{#if view === 'bookmark'}
					<BookmarkInstances />
				{:else if view === 'engine'}
					<p>engine</p>
				{:else}
					<p>legend</p>
				{/if}
			{/if}
		</class>
	</div>

	<OptionsComponent event={handleOptionEvent} bind:visible />
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
	}

	.settings {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background-color: blanchedalmond;
		z-index: var(--more-options-z-index);
		transform: translateY(0%);
		transition: transform 0.2s ease-out;
		display: flex;
	}

	.hide-settings {
		transform: translateY(100%);
	}
</style>

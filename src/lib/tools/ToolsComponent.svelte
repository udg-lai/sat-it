<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		hide: boolean;
	}

	let { hide: hide }: Props = $props();

	let views = $state(new Map(
		Object.entries({
			viewA: false,
			viewB: false,
			viewC: false,
			viewD: false
		})
	));

	function onToggleSameView() {
		hide = !hide;
	}

	function activateView(view: string): void {
		if (!views.has(view)) {
			console.warn(`Accessing to not defined view ${view}`);
		} else {
			console.log(`Activating view ${view}`);
			const viewActive: boolean = views.get(view) as boolean;
			if (!viewActive) {
				views = new Map<string, boolean>([...views].map(([k]) => [k, false]));
				views.set(view, true);
			} else {
				onToggleSameView();
			}
			console.log(views)
		}
	}
</script>

<div class="tools-container">
	<div class="options-tools">
		<div class="vertical-separator"></div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewA')} />
		</div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewB')} />
		</div>
		<div class="toggle-button">
			<Button onClick={() => activateView('viewC')} />
		</div>
		<div class="toggle-button"></div>
		<div class="toggle-button"></div>
	</div>
	<div class="tools" class:hide>
		{#each views as [view, visible] (view)}
			{#if view === 'viewA' && visible}
				<span>{view}</span>
			{:else if view === 'viewB' && visible}
				<span>{view}</span>
			{:else if view === 'viewC' && visible}
				<span>{view}</span>
			{/if}
		{/each}
	</div>
</div>

<style>
	.options-tools {
		position: relative;
		padding: 1rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.options-tools > .toggle-button:not(:last-child) {
		margin-bottom: 1rem;
	}

	.tools {
		width: var(--width);
	}

	.tools-container {
		height: 100%;
		display: flex;
		position: relative;
	}

	.hide {
		width: 0;
	}
</style>

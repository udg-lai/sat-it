<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		display: boolean;
		padding?: string;
		verticalList?: boolean;
	}

	let {
		display: inspecting,
		children,
		padding = '0.25rem',
		verticalList = false
	}: Props = $props();

	let color = $derived(inspecting ? 'var(--inspecting-color)' : 'transparent');

	let inspectingOpacity = $derived(inspecting ? 1 : 0);
</script>

<head-tail
	style="--color: {color}; --padding: {padding}; --inspecting-opacity: {inspectingOpacity}"
	class:horizontal-display={!verticalList}
	class:vertical-display={verticalList}
>
	{@render children()}
</head-tail>

<style>
	head-tail {
		position: relative;
		display: block;
	}



	head-tail::after {
		content: '';
		position: absolute;

		width: 6px;
		height: 2px;

		transform: translateX(-50%);
		background-color: var(--color);
		border-radius: 75%;
		pointer-events: none;
		opacity: var(--inspecting-opacity);
	}

	head-tail[style*='--inspecting-opacity: 1']::after {
		animation-play-state: running;
	}

	.horizontal-display::after {
		left: 50%;
		bottom: -8px;
	}

	.vertical-display::after {
		bottom: calc(50% - 2px);
	}
</style>

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
	@keyframes blink {
		0% {
			opacity: 0.7;
			transform: translateX(-50%) scale(0.9);
		}
		50% {
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
		100% {
			opacity: 0.7;
			transform: translateX(-50%) scale(0.9);
		}
	}

	head-tail {
		position: relative;
		display: block;
	}

	head-tail::after {
		content: '';
		position: absolute;

		width: 4px;
		height: 4px;

		transform: translateX(-50%);
		background-color: var(--color);
		border-radius: 50%;
		pointer-events: none;

		opacity: var(--inspecting-opacity);
		transition: opacity 0.15s ease;

		animation: blink 2s infinite ease-in-out;
		animation-play-state: paused;
	}

	head-tail[style*='--inspecting-opacity: 1']::after {
		animation-play-state: runninsg;
	}

	.horizontal-display::after {
		left: 50%;
		bottom: -8px;
	}

	.vertical-display::after {
		bottom: calc(50% - 2px);
	}
</style>

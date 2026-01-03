<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		display: boolean;
		padding?: string;
	}

	let { display: inspecting, children, padding = '0.25rem' }: Props = $props();

	let color = $derived(inspecting ? 'var(--inspecting-color)' : 'transparent');

	let inspectingOpacity = $derived(inspecting ? 1 : 0);
</script>

<head-tail
	style="--color: {color}; --padding: {padding}; --inspecting-opacity: {inspectingOpacity}"
>
	{@render children()}
</head-tail>

<style>
	@keyframes blink {
		0% {
			opacity: 0.5;
			transform: translateX(-50%) scale(0.8);
		}
		50% {
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
		100% {
			opacity: 0.5;
			transform: translateX(-50%) scale(0.8);
		}
	}

	head-tail {
		position: relative;
		display: block;
	}

	head-tail::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: -8px;

		width: 4px;
		height: 4px;

		transform: translateX(-50%);
		background-color: var(--color);
		border-radius: 50%;
		pointer-events: none;

		opacity: var(--inspecting-opacity);
		transition: opacity 0.15s ease;

		animation: blink 1s infinite ease-in-out;
		animation-play-state: paused;
	}

	head-tail[style*='--inspecting-opacity: 1']::after {
		animation-play-state: running;
	}
</style>

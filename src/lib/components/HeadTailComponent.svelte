<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		display: boolean;
		padding?: string;
	}

	let { display: inspecting, children, padding = '0.25rem' }: Props = $props();

	let color = $derived(inspecting ? 'var(--inspecting-color)' : 'transparent');
</script>

<head-tail>
	<div class="tail" style="--color: {color}; --padding: 2px;">
		<div class="tail" style="--color: {color}; --padding: {padding};">
			{@render children()}
		</div>
	</div>
</head-tail>

<style>
	.tail {
		padding: var(--padding);
		border-radius: 1px;
		border: 1px solid var(--color);
		width: 100%;
	}
</style>

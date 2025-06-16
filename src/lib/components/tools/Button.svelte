<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import type { Component } from 'svelte';

	interface Props {
		onClick?: () => void;
		icon?: Component;
		active?: boolean;
		title?: string;
	}

	let { onClick, icon, active, title }: Props = $props();
	const iconProps = {
		class: 'h-8 w-8 cursor-pointer'
	};
</script>

<div class="flex flex-row">
	<button onclick={onClick} type="button" class="button-high-contrast !p-2" class:active {title}>
		{#if icon}
			<DynamicRender component={icon} props={iconProps} />
		{/if}
	</button>
</div>

<style>
	.button-high-contrast {
		background-color: transparent;
		padding: 8px 16px;
		font-weight: bold;
		text-transform: uppercase;
		cursor: pointer;
		outline: none;
		transition:
			background 0.2s,
			color 0.2s;
		color: var(--secondary-font-color);
	}

	.button-high-contrast:hover {
		color: var(--main-font-color);
	}

	.button-high-contrast:active {
		color: var(--main-font-color);
	}

	.active {
		color: var(--main-font-color);
	}
</style>

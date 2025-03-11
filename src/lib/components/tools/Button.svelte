<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import type { Component } from 'svelte';

	interface Props {
		onClick?: () => void;
		icon?: Component;
		active?: boolean;
	}

	let { onClick, icon, active }: Props = $props();
	const iconProps = {
		class: 'h-10 w-10 cursor-pointer'
	};
</script>

<button onclick={onClick} type="button" class="button-high-contrast !p-2" class:active={active}>
	{#if icon}
		<DynamicRender component={icon} props={iconProps} />
	{/if}
</button>

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
		border: 1px solid transparent;
		color: var(--secondary-font-color);
	}

	.button-high-contrast:hover {
		border-width: 1px;
		border-style: dashed;
		border-color: var(--focus-border-color);
		color: var(--main-font-color);
	}

	.button-high-contrast:active {
		border-style: solid;
	}

	.button-high-contrast.active {
		color: var(--main-font-color);
	}
</style>

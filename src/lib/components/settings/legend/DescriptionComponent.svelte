<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import type { Component } from 'svelte';

	interface Props {
		icon?: Component;
		description: string;
	}

	let { icon, description }: Props = $props();

    const iconProps = {
		size: 'md'
	};
</script>

<div class="container">
	<div class="icon-zone">
		{#if icon}
			<DynamicRender component={icon} props={iconProps} />
		{/if}
	</div>
	<div class="description-zone">
		{description}
	</div>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
		height: 48px;
		border: 1px solid #ccc;
		border-radius: 6px;
		overflow: hidden;
		font-family: sans-serif;
	}

	.icon-zone {
		width: 48px;
		height: 100%;
		background-color: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.description-zone {
		flex: 1;
		padding: 0 12px;
		background-color: #ffffff;
		display: flex;
		align-items: center;
	}
</style>

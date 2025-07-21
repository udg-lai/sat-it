<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import type { Component } from 'svelte';

	interface Props {
		component?: Component;
		componentProps?: Record<string, unknown>;
		description: string;
	}

	let { component, componentProps, description }: Props = $props();
</script>

<div class="container">
	<div class="icon-zone">
		<DynamicRender {component} props={componentProps} />
	</div>
	<div class="description-zone">
		{description}
	</div>
</div>

<style>
	.container {
		min-height: 55px;
		display: flex;
		align-items: center;
		border: 1px solid var(--border-color);
		border-radius: 6px;
	}

	.icon-zone {
		height: 100%;
		width: 50px;
		background-color: var(--button-color);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		pointer-events: none;
	}

	.description-zone {
		height: 100%;
		display: flex;
		flex: 1;
		background-color: #ffffff;
		align-items: center;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 0 10px 0 10px;
		border-bottom-right-radius: 6px;
		border-top-right-radius: 6px;
	}
</style>

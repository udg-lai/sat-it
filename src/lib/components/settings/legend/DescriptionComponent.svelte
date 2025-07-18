<script lang="ts">
	import DynamicRender from '$lib/components/DynamicRender.svelte';
	import type { Component } from 'svelte';

	interface Props {
		component?: Component;
		description: string;
	}

	let { component, description }: Props = $props();

</script>

<div class="container">
	<div class="icon-zone">
		{#if component}
			<DynamicRender {component} />
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
		min-height: 50px;
		border: 1px solid #ccc;
		border-radius: 6px;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.icon-zone {
		width: 50px;
		height: 100%;
		background-color: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.description-zone {
		flex: 1;
		padding-left: 12px;
		background-color: #ffffff;
		display: flex;
		align-items: center;
	}
</style>

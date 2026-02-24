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
		<div class="text-area">
			<div class="text">
				{description}
			</div>
		</div>
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
		flex: 1;
		height: 100%;
		padding: 0.25rem;
	}

	.description-zone .text-area {
		height: 100%;
		width: 100%;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 0.4rem 0.25rem;
		display: flex;
		align-items: center;
	}

	.description-zone .text-area .text {
		line-height: 1.2;
	}
</style>

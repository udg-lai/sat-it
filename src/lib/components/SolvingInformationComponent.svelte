<script lang="ts">
	import StatisticsComponent from './StatisticsComponent.svelte';
	import type { InteractiveInstance } from '$lib/entities/InteractiveInstance.svelte.ts';
	import { getActiveInstance } from '$lib/states/instances.svelte.ts';

	import { getConfiguredAlgorithm } from '$lib/components/settings/engine/state.svelte.ts';

	const algorithm: string = $derived(getConfiguredAlgorithm());

	const instanceName: string = $derived.by(() => {
		const instance: InteractiveInstance | undefined = getActiveInstance();
		if (instance == undefined) return '';
		else return instance.getInstanceName();
	});
</script>

<solving-info>
	<div class="selected-configuration">
		<span>{instanceName} - {algorithm}</span>
	</div>
	<StatisticsComponent />
</solving-info>

<style>
	solving-info {
		height: var(--solving-info-height);
		border-top: 1px solid var(--border-color);
		width: 100%;
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 0.5rem calc(var(--windows-padding) + 15px);
	}

	.selected-configuration {
		align-items: center;
		justify-content: center;
		flex: 1;
		display: flex;
	}
</style>

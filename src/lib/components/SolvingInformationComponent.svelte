<script lang="ts">
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { changeInstanceEventBus } from '$lib/transversal/events.ts';
	import { onMount } from 'svelte';
	import StatisticsComponent from './StatisticsComponent.svelte';

	let activeInstance: string = $state('');
	const problem: Problem = $derived(getProblemStore());

	const updateActiveInstance = (name: string) => {
		activeInstance = name;
	};

	onMount(() => {
		const unsuscribeInstanceStore = changeInstanceEventBus.subscribe(updateActiveInstance);

		return () => {
			unsuscribeInstanceStore();
		};
	});
</script>

<solving-info>
	<div class="selected-configuration">
		<span>{activeInstance} - {problem.algorithm}</span>
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

<script lang="ts">
	import { getProblemStore } from '$lib/states/problem.svelte.ts';
	import { onMount } from 'svelte';
	import StatisticsComponent from './StatisticsComponent.svelte';
	import { changeInstanceEventBus } from '$lib/events/events.ts';
	import type Problem from '$lib/entities/Problem.svelte.ts';

	let activeInstance: string = $state('');
	const problem: Problem = $derived(getProblemStore());

	const updateActiveInstance = (name: string) => {
		activeInstance = name;
	};

	onMount(() => {
		const unsubscribe = changeInstanceEventBus.subscribe(updateActiveInstance);

		return () => {
			unsubscribe();
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

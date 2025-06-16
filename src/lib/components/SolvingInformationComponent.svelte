<script lang="ts">
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { changeInstanceEventBus } from '$lib/transversal/events.ts';
	import { onMount } from 'svelte';

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

<div class="text">
	<span class="text-right">{problem.algorithm}</span>
	<span class="text-left">{activeInstance}</span>
</div>

<style>
	.text {
		display: flex;
		flex-wrap: wrap;
		flex: 1;
		justify-content: space-around;
		align-items: center;
		border-top: 1px solid var(--border-color);
		width: 100%;
	}
</style>

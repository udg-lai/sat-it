<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import TrailComponent from './TrailComponent.svelte';

	interface Props {
		trail: Trail;
		index: number;
		expanded: boolean;
	}
	let { trail, index, expanded }: Props = $props();

	let hoverIndex = $state(false);
	let noDecisions = $derived(trail.getDecisions().length === 0);
	let allDecisions = $derived(trail.getDecisions().length === trail.getAssignments().length);
	let noPropagations = $derived(
		trail
			.getDecisions()
			.map((_, index) => trail.getPropagations(index + 1))
			.flat().length === 0
	);

	let disabled = $derived(noDecisions || allDecisions || noPropagations);
</script>

<div class="line">
	<button
		class="enumerate transition"
		onmouseenter={() => (hoverIndex = true)}
		onmouseleave={() => (hoverIndex = false)}
		onclick={() => (expanded = !expanded)}
		{disabled}
	>
		<span class="line-item chakra-petch-medium" class:line-item-active={hoverIndex}>
			{#if disabled}
				<p>{index}</p>
			{:else if !hoverIndex}
				<p>{index}</p>
			{:else if expanded}
				<ChevronLeftOutline slot="icon" class="h-8 w-8" />
			{:else}
				<ChevronRightOutline slot="icon" class="h-8 w-8" />
			{/if}
		</span>
	</button>
	<TrailComponent {trail} bind:expanded />
</div>

<style>
	.line {
		display: flex;
		position: relative;
	}

	.line span {
		position: absolute;
		align-self: center;
	}

	.line-item {
		font-size: 1.5rem;
		opacity: 0.5;
	}

	.line-item-active {
		opacity: 1;
	}

	.enumerate {
		display: flex;
		justify-content: center;
		width: 4rem;
		height: 4rem;
		position: relative;
	}
</style>

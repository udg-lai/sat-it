<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import TrailComponent from './TrailComponent.svelte';

	interface Props {
		trail: Trail;
		index: number;
	}

	let { trail, index }: Props = $props();

	let noDecisions = $derived(trail.getDecisions().length === 0);
	let allDecisions = $derived(trail.getDecisions().length === trail.getAssignments().length);
	let noPropagations = $derived(
		trail
			.getDecisions()
			.map((_, index) => trail.getPropagations(index + 1))
			.flat().length === 0
	);

	let hoverIndex = $state(false);
	let expanded = $state(false);
</script>

<div class="line">
	<button
		class="enumerate transition"
		onmouseenter={() => (hoverIndex = true)}
		onmouseleave={() => (hoverIndex = false)}
		onclick={() => (expanded = !expanded)}
	>
		<span class="line-item chakra-petch-medium" class:line-item-active={hoverIndex}>
			{#if !hoverIndex || noDecisions || allDecisions || noPropagations}
				<p>{index}</p>
			{:else if expanded}
				<ChevronLeftOutline slot="icon" class="h-8 w-8" />
			{:else}
				<ChevronRightOutline slot="icon" class="h-8 w-8" />
			{/if}
		</span>
	</button>
	<TrailComponent
		{trail}
		{expanded}
		emitAllOpen={() => (expanded = true)}
		emitNotAllOpen={() => (expanded = false)}
	/>
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

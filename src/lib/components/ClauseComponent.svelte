<script lang="ts">
	import Clause from '$lib/transversal/entities/Clause.ts';
	import LiteralComponent from './LiteralComponent.svelte';
	import MathTexComponent from './MathTexComponent.svelte';

	interface Props {
		clause: Clause;
	}

	let { clause }: Props = $props();
</script>

<div class="clause-style">
	{#each clause as lit, i (i)}
		<LiteralComponent literal={lit} />
		{#if i < clause.nLiterals() - 1}
			<MathTexComponent equation={'\\lor'} fontSize={'1rem'} />
		{/if}
	{/each}
</div>

<style>
	.clause-style {
		color: black;
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
	}
</style>

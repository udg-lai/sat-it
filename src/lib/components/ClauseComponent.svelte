<script lang="ts">
	import Clause from '$lib/transversal/entities/Clause.svelte.ts';
	import LiteralComponent from './LiteralComponent.svelte';
	import MathTexComponent from './MathTexComponent.svelte';

	interface Props {
		clause: Clause;
	}

	let { clause }: Props = $props();
</script>

<clause>
	{#each clause as lit, i (i)}
		<LiteralComponent literal={lit} />
		{#if i < clause.nLiterals() - 1}
			<MathTexComponent equation={'\\lor'} fontSize={'1rem'} />
		{/if}
	{/each}
</clause>

<style>
	clause {
		color: var(--clause-color);
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
		padding: 0.25rem;
	}
</style>

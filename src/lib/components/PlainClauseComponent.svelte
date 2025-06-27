<script lang="ts">
	import { BookOutline } from 'flowbite-svelte-icons';
	import Clause from '$lib/entities/Clause.svelte.ts';
	import MathTexComponent from './MathTexComponent.svelte';
	import PlainLiteralComponent from './PlainLiteralComponent.svelte';
	import type Literal from '$lib/entities/Literal.svelte.ts';

	interface Props {
		clause: Clause;
		reverse?: boolean;
	}

	let { clause, reverse = false }: Props = $props();

	let literals: Literal[] = $derived.by(() => {
		const lits = [...clause];
		return reverse ? lits.reverse() : lits;
	});
</script>

<clause>
	{#each literals as lit, i (i)}
		<PlainLiteralComponent literal={lit} />
		{#if i < clause.nLiterals() - 1}
			<div class="lor">
				<MathTexComponent equation={'\\lor'} fontSize={'1rem'} />
			</div>
		{/if}
	{/each}
</clause>

<style>
	clause {
		color: var(--clause-color);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
		padding: 0 calc(4px + 0.25rem);
	}

	.lor {
		width: var(--trail-literal-min-width);
		height: calc(var(--trail-literal-min-width) - 10px);
		display: flex;
		flex-direction: column;
		justify-content: end;
	}
</style>

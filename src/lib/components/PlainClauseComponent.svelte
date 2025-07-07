<script lang="ts">
	import Clause from '$lib/entities/Clause.svelte.ts';
	import PlainLiteralComponent from './PlainLiteralComponent.svelte';
	import type Literal from '$lib/entities/Literal.svelte.ts';

	interface Props {
		clause: Clause;
		reverse?: boolean;
		hide?: number[];
		state?: 'unsatisfied' | 'satisfied';
	}

	let { clause, reverse = false, hide = [], state }: Props = $props();

	const hideSet = new Set(hide);

	let literals: Literal[] = $derived.by(() => {
		const lits = [...clause];
		const reversed = reverse ? lits.reverse() : lits;
		return reversed.filter((lit) => !hideSet.has(lit.toInt()));
	});
</script>

<clause
	class:satisfied-background={state === 'satisfied'}
	class:unsatisfied-background={state === 'unsatisfied'}
>
	{#each literals as lit, i (i)}
		<PlainLiteralComponent literal={lit} />
	{/each}
</clause>

<style>
	clause {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
		padding: 0 calc(4px + 0.25rem);
		min-width: var(--empty-slot);
	}

	.satisfied-background {
		background-color: var(--satisfied-color-o);
	}

	.unsatisfied-background {
		background-color: var(--unsatisfied-color-o);
	}
</style>

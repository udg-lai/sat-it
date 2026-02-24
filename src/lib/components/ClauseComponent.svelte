<script lang="ts">
	import Clause from '$lib/entities/Clause.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { Lit } from '$lib/types/types.ts';
	import LiteralComponent from './LiteralComponent.svelte';
	import MathTexComponent from './MathTexComponent.svelte';

	interface Props {
		classStyle?: string;
		clause: Clause;
	}

	let { clause, classStyle }: Props = $props();

	const watchedLiterals: Set<Lit> = $derived.by(() => {
		if (getSolverMachine().identify() === 'twatch' && clause.size() >= 2) {
			const sortedLiterals = clause.getLiterals();
			return new Set<Lit>([sortedLiterals[0].toInt(), sortedLiterals[1].toInt()]);
		} else {
			return new Set<Lit>();
		}
	});
</script>

<clause class={classStyle ?? ''}>
	{#if clause.isEmpty()}
		<empty-clause> </empty-clause>
	{:else}
		{#each clause as lit, i (i)}
			<LiteralComponent literal={lit} watched={watchedLiterals.has(lit.toInt())} />
			{#if i < clause.size() - 1}
				<MathTexComponent equation={'\\lor'} fontSize={'1rem'} />
			{/if}
		{/each}
	{/if}
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

	empty-clause {
		height: var(--font-size);
		width: var(--font-size);
		color: var(--clause-color);
		border-color: var(--unsatisfied-color);
		border-width: 1px;
	}
</style>

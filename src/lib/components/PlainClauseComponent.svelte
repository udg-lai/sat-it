<script lang="ts">
	import Clause from '$lib/entities/Clause.svelte.ts';
	import PlainLiteralComponent from './PlainLiteralComponent.svelte';
	import type Literal from '$lib/entities/Literal.svelte.ts';

	interface Props {
		clause: Clause;
		reverse?: boolean;
		hide?: number[];
		state?: 'unsatisfied' | 'satisfied' | undefined;
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
	class:temporal-background={state === undefined && clause.getTag() === undefined}
	class:lemma-background={state === undefined && clause.getTag() !== undefined}
>
	{#each literals as lit, i (i)}
		<PlainLiteralComponent
			literal={lit}
			{state}
			learned={state === undefined && clause.getTag() !== undefined}
		/>
	{/each}
</clause>

<style>
	clause {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 calc(4px + 0.25rem);
		min-width: var(--empty-slot);
		top: -0.5px;
	}

	.satisfied-background {
		position: relative;
	}

	.satisfied-background::after {
		position: absolute;
		top: 0px;
		width: var(--plain-literal-width);
		border-top: 1px solid;
		border-color: var(--satisfied-border-color-o);
		content: '';
	}

	.unsatisfied-background {
		position: relative;
	}

	.unsatisfied-background::after {
		position: absolute;
		top: 0px;
		width: var(--plain-literal-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--unsatisfied-border-color-o);
		content: '';
	}

	.unsatisfied-background::after {
		position: absolute;
		bottom: 0px;
		width: var(--plain-literal-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--unsatisfied-border-color-o);
		content: '';
	}

	.temporal-background {
		position: relative;
	}

	.temporal-background::before {
		position: absolute;
		top: 0px;
		width: var(--plain-literal-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--temporal-color);
		content: '';
	}

	.temporal-background::after {
		position: absolute;
		bottom: 0px;
		width: var(--plain-literal-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--temporal-color);
		content: '';
	}

	.lemma-background {
		position: relative;
	}

	.lemma-background::before {
		position: absolute;
		top: 0px;
		width: var(--plain-literal-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--lemma-border-color);
		content: '';
	}

	.lemma-background::after {
		position: absolute;
		bottom: 0px;
		width: var(--plain-literal-width);
		height: 1px;
		border-top: 1px solid;
		border-color: var(--lemma-border-color);
		content: '';
	}
</style>
